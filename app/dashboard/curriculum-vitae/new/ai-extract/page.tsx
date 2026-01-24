'use client'

import { Suspense, useState, useCallback, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Button } from '../../../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { Alert, AlertDescription } from '../../../../../components/ui/alert'
import { Badge } from '../../../../../components/ui/badge'
import { Separator } from '../../../../../components/ui/separator'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, Link as LinkIcon, User } from 'lucide-react'
import { toast } from 'sonner'
import type { Cv } from '../../../../../schemas/cv.schema'
import { BlobCVsList } from '@/components/cv/blob-cvs-list'

interface ApiResponse {
  success: boolean
  data: Cv
  error?: string
}

function AIExtractPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [extractedData, setExtractedData] = useState<Cv | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const blobUrl = searchParams.get('blobUrl')
  
  // Job seeker source support
  const sourceType = searchParams.get('source')
  const jobSeekerId = searchParams.get('id')
  const isJobSeekerSource = sourceType === 'job-seeker' && jobSeekerId
  
  // Fetch job seeker data if source is job-seeker
  const jobSeeker = useQuery(
    api.jobSeekers.getJobSeekerById,
    isJobSeekerSource ? { id: jobSeekerId as Id<"jobSeekers"> } : 'skip'
  )
  
  // Determine effective blob URL (from query param or job seeker's CV)
  const effectiveBlobUrl = useMemo(() => {
    if (blobUrl) return blobUrl
    if (isJobSeekerSource && jobSeeker?.cvUploadPath) {
      return jobSeeker.cvUploadPath
    }
    return null
  }, [blobUrl, isJobSeekerSource, jobSeeker?.cvUploadPath])

  const extractCVMutation = useMutation({
    mutationFn: async (input: File | string): Promise<ApiResponse> => {
      const formData = new FormData()
      
      if (typeof input === 'string') {
        // Handle blob URL
        formData.append('blobUrl', input)
      } else {
        // Handle file upload
        formData.append('pdf', input)
      }

      const response = await fetch('/api/cv/ai-extract', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process CV')
      }

      return result
    },
    onSuccess: (data) => {
      setExtractedData(data.data)
      setSelectedFile(null) // Clear selected file after successful extraction
      toast.success('CV extracted successfully!')
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process CV'
      toast.error(errorMessage)
    },
  })

  const handleExtractFromBlob = useCallback(() => {
    if (effectiveBlobUrl) {
      extractCVMutation.mutate(effectiveBlobUrl)
    }
  }, [effectiveBlobUrl, extractCVMutation])

  const handleExtractFromFile = useCallback(() => {
    if (selectedFile) {
      extractCVMutation.mutate(selectedFile)
    }
  }, [selectedFile, extractCVMutation])

  const saveCVDirectMutation = useMutation({
    mutationFn: async (cvData: Cv) => {
      const response = await fetch('/api/cv/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          executiveSummary: cvData.executiveSummary,
          personalInfo: cvData.personalInfo,
          workHistory: cvData.workHistory,
          education: cvData.education,
          skills: cvData.skills,
          isAiAssisted: true,
          sourceJobSeekerId: isJobSeekerSource ? jobSeekerId : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save CV')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('CV saved successfully!')
      setExtractedData(null)
      router.push('/dashboard/curriculum-vitae')
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save CV'
      toast.error(errorMessage)
    },
  })

  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ]

      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOC, DOCX, or TXT file')
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      // Store the file instead of immediately processing
      setSelectedFile(file)
      setExtractedData(null) // Clear any previous extraction
    },
    []
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0])
      }
    },
    [handleFileSelect]
  )

  const handleSaveCV = useCallback(() => {
    if (!extractedData) return

    try {
      // Store in sessionStorage for the edit page
      sessionStorage.setItem('aiExtractedCV', JSON.stringify(extractedData))
      router.push('/dashboard/curriculum-vitae/new')
    } catch {
      toast.error('Failed to save CV data')
    }
  }, [extractedData, router])

  const handleSaveCVDirectly = useCallback(() => {
    if (!extractedData) return
    saveCVDirectMutation.mutate(extractedData)
  }, [extractedData, saveCVDirectMutation])

  const isProcessing = extractCVMutation.isPending
  const isSavingDirect = saveCVDirectMutation.isPending

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI CV Extraction</h1>
          <p className="text-muted-foreground mt-2">
            Upload your CV and let AI extract the information automatically
          </p>
        </div>

        {/* Job Seeker Source Section */}
        {isJobSeekerSource && jobSeeker && !extractedData && !isProcessing && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                CV from Job Seeker: {jobSeeker.firstName} {jobSeeker.lastName}
              </CardTitle>
              <CardDescription>
                Extracting CV for this job seeker. The generated CV will be linked to their profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3 space-y-1">
                  <p className="text-sm"><span className="font-medium">Email:</span> {jobSeeker.email}</p>
                  <p className="text-sm"><span className="font-medium">Phone:</span> {jobSeeker.mobileNumber}</p>
                </div>
                <Button 
                  onClick={handleExtractFromBlob}
                  className="w-full"
                  size="lg"
                  disabled={!effectiveBlobUrl}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start AI Extraction
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blob URL Section (non-job-seeker) */}
        {effectiveBlobUrl && !isJobSeekerSource && !extractedData && !isProcessing && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                CV from Blob Storage
              </CardTitle>
              <CardDescription>
                A CV file has been loaded from blob storage. Click the button below to start AI extraction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Blob URL:</p>
                  <p className="text-sm break-all">{effectiveBlobUrl}</p>
                </div>
                <Button 
                  onClick={handleExtractFromBlob}
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start AI Extraction
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected File Section */}
        {selectedFile && !extractedData && !isProcessing && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Selected CV File
              </CardTitle>
              <CardDescription>
                A file has been selected. Click the button below to start AI extraction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">File Name:</p>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleExtractFromFile}
                    className="flex-1"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start AI Extraction
                  </Button>
                  <Button 
                    onClick={() => setSelectedFile(null)}
                    variant="outline"
                  >
                    Remove File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Choose from uploaded CVs - only in initial state */}
        {!effectiveBlobUrl && !selectedFile && !extractedData && !isJobSeekerSource && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Or choose from your uploaded CVs
              </CardTitle>
              <CardDescription>
                Select an existing file to run AI extraction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlobCVsList variant="picker" />
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        {!effectiveBlobUrl && !selectedFile && !extractedData && !isJobSeekerSource && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CV File
              </CardTitle>
              <CardDescription>
                Supported formats: PDF, DOC, DOCX, TXT (max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Drop your CV file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileInput}
                    className="hidden"
                    id="cv-file-input"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="cv-file-input" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing State */}
        {isProcessing && !extractedData && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div>
                  <p className="font-medium">AI is processing your CV...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take a few moments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {extractCVMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {extractCVMutation.error instanceof Error
                ? extractCVMutation.error.message
                : 'An error occurred while processing your CV'}
            </AlertDescription>
          </Alert>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Extraction Complete
              </CardTitle>
              <CardDescription>
                Review the extracted information below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm text-muted-foreground">
                    {extractedData.personalInfo.firstName} {extractedData.personalInfo.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Profession</label>
                  <p className="text-sm text-muted-foreground">
                    {extractedData.personalInfo.profession}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">
                    {extractedData.personalInfo.email}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">Name</label>
                    <p className="text-muted-foreground">
                      {extractedData.personalInfo.firstName} {extractedData.personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium">Email</label>
                    <p className="text-muted-foreground">{extractedData.personalInfo.email}</p>
                  </div>
                  <div>
                    <label className="font-medium">Phone</label>
                    <p className="text-muted-foreground">{extractedData.personalInfo.phone}</p>
                  </div>
                  <div>
                    <label className="font-medium">Location</label>
                    <p className="text-muted-foreground">{extractedData.personalInfo.location}</p>
                  </div>
                  <div>
                    <label className="font-medium">Profession</label>
                    <p className="text-muted-foreground">{extractedData.personalInfo.profession}</p>
                  </div>
                  <div>
                    <label className="font-medium">Nationality</label>
                    <p className="text-muted-foreground">{extractedData.personalInfo.nationality}</p>
                  </div>
                  <div>
                    <label className="font-medium">Gender</label>
                    <p className="text-muted-foreground capitalize">{extractedData.personalInfo.gender}</p>
                  </div>
                  <div>
                    <label className="font-medium">Availability</label>
                    <p className="text-muted-foreground">{extractedData.personalInfo.availability}</p>
                  </div>
                  <div>
                    <label className="font-medium">Current Salary</label>
                    <p className="text-muted-foreground">${extractedData.personalInfo.currentSalary.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="font-medium">Expected Salary</label>
                    <p className="text-muted-foreground">${extractedData.personalInfo.expectedSalary.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Executive Summary */}
              <div>
                <h3 className="font-semibold mb-3">Executive Summary</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {extractedData.executiveSummary}
                </p>
              </div>

              <Separator />

              {/* Work Experience */}
              <div>
                <h3 className="font-semibold mb-3">Work Experience</h3>
                <div className="space-y-3">
                  {extractedData.workHistory.experiences.length > 0 ? (
                    extractedData.workHistory.experiences.map((exp, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{exp.position}</h4>
                          <span className="text-sm text-muted-foreground">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{exp.company}</p>
                        {exp.duties.length > 0 && (
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {exp.duties.map((duty, i) => (
                              <li key={i}>{duty}</li>
                            ))}
                          </ul>
                        )}
                        {exp.reasonForLeaving && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Reason for leaving:</span> {exp.reasonForLeaving}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No work experience found</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Education */}
              <div>
                <h3 className="font-semibold mb-3">Education</h3>
                <div className="space-y-2">
                  {extractedData.education.educations.length > 0 ? (
                    extractedData.education.educations.map((edu, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">{edu.qualification}</p>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{edu.completionDate}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No education information found</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Skills */}
              <div>
                <h3 className="font-semibold mb-3">Skills</h3>
                <div className="space-y-3">
                  {extractedData.skills.computerSkills.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Computer Skills</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {extractedData.skills.computerSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {extractedData.skills.otherSkills.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Other Skills</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {extractedData.skills.otherSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button 
                  onClick={handleSaveCVDirectly} 
                  disabled={isSavingDirect}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSavingDirect ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving CV...
                    </>
                  ) : (
                    'Save CV Now'
                  )}
                </Button>
                <Button onClick={handleSaveCV} variant="outline" className="flex-1">
                  Continue to Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setExtractedData(null)
                    setSelectedFile(null)
                  }}
                >
                  Upload Another CV
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function AIExtractPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <AIExtractPageContent />
    </Suspense>
  )
}

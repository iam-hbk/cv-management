'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { CVFormData } from '@/schemas/cv.schema'

interface ExtractedData {
  isValidCV: boolean
  validationMessage: string
  status: 'draft' | 'completed'
  jobTitle: string
  formData: CVFormData
}

export default function AIExtractPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    setError(null)
    setExtractedData(null)

    try {
      const formData = new FormData()
      formData.append('cv', file)

      setIsProcessing(true)
      setIsUploading(false)

      const response = await fetch('/api/cv/ai-extract', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process CV')
      }

      setExtractedData(result.extractedData)
      toast.success('CV extracted successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process CV'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setIsProcessing(false)
    }
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
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

      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleSaveCV = useCallback(async () => {
    if (!extractedData) return

    try {
      // Navigate to the edit page with the extracted data
      // We'll pass the data via URL params or local storage
      const cvData = {
        status: extractedData.status,
        jobTitle: extractedData.jobTitle,
        formData: extractedData.formData,
        isAiAssisted: true,
      }

      // Store in sessionStorage for the edit page
      sessionStorage.setItem('aiExtractedCV', JSON.stringify(cvData))

      router.push('/dashboard/curriculum-vitae/new')
    } catch (err) {
      toast.error('Failed to save CV data')
    }
  }, [extractedData, router])

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

        {/* Upload Section */}
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
              {isUploading || isProcessing ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">
                      {isUploading ? 'Uploading file...' : 'AI is processing your CV...'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isProcessing ? 'This may take a few moments' : 'Please wait'}
                    </p>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <p className="text-sm text-muted-foreground">{extractedData.jobTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant={extractedData.status === 'completed' ? 'default' : 'secondary'}>
                    {extractedData.status}
                  </Badge>
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
                      {extractedData.formData.personalInfo.firstName} {extractedData.formData.personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium">Email</label>
                    <p className="text-muted-foreground">{extractedData.formData.personalInfo.email}</p>
                  </div>
                  <div>
                    <label className="font-medium">Phone</label>
                    <p className="text-muted-foreground">{extractedData.formData.personalInfo.phone}</p>
                  </div>
                  <div>
                    <label className="font-medium">Location</label>
                    <p className="text-muted-foreground">{extractedData.formData.personalInfo.location}</p>
                  </div>
                  <div>
                    <label className="font-medium">Profession</label>
                    <p className="text-muted-foreground">{extractedData.formData.personalInfo.profession}</p>
                  </div>
                  <div>
                    <label className="font-medium">Nationality</label>
                    <p className="text-muted-foreground">{extractedData.formData.personalInfo.nationality}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Executive Summary */}
              <div>
                <h3 className="font-semibold mb-3">Executive Summary</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {extractedData.formData.executiveSummary}
                </p>
              </div>

              <Separator />

              {/* Work Experience */}
              <div>
                <h3 className="font-semibold mb-3">Work Experience</h3>
                <div className="space-y-3">
                  {extractedData.formData.workHistory.experiences.length > 0 ? (
                    extractedData.formData.workHistory.experiences.map((exp, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{exp.position}</h4>
                          <span className="text-sm text-muted-foreground">
                            {typeof exp.startDate === 'string' ? exp.startDate : exp.startDate.toLocaleDateString()} - {exp.endDate ? (typeof exp.endDate === 'string' ? exp.endDate : exp.endDate.toLocaleDateString()) : 'Present'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{exp.company}</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {exp.duties.map((duty, i) => (
                            <li key={i}>{duty}</li>
                          ))}
                        </ul>
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
                  {extractedData.formData.education.educations.length > 0 ? (
                    extractedData.formData.education.educations.map((edu, index) => (
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
                  <div>
                    <label className="text-sm font-medium">Computer Skills</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {extractedData.formData.skills.computerSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Other Skills</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {extractedData.formData.skills.otherSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button onClick={handleSaveCV} className="flex-1">
                  Continue to Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setExtractedData(null)
                    setError(null)
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

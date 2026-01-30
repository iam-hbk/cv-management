/**
 * Parse filename from Content-Disposition header.
 * Uses filename(?!\*) to avoid matching filename* (RFC 5987).
 * Does not capture the closing " or control chars that cause docx__ when sanitized.
 */
export function parseContentDispositionFilename(header: string | null): string | null {
	if (!header) return null;
	const quoted = /filename(?!\*)="([^"]*)"/i.exec(header);
	if (quoted?.[1]) {
		const s = quoted[1].replace(/[\r\n"]/g, "").trim();
		return s || null;
	}
	const unquoted = /filename(?!\*)=([^;\s]+)/i.exec(header);
	if (unquoted?.[1]) {
		const s = unquoted[1].replace(/[\r\n"]/g, "").trim();
		return s || null;
	}
	return null;
}

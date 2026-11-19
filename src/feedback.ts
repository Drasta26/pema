// Builds the email for feedback. Nothing is sent by PeMA itself: the person's own
// email app opens with this filled in, and they choose whether to send it.
export function feedbackMailto(to: string, liked: boolean, text: string, version: string): string {
  const subject = `PeMA feedback ${liked ? '👍' : '👎'}`;
  const body = `${liked ? 'I like PeMA.' : 'Something could be better.'}\n\n${text.trim() || '(no comment)'}\n\n— Sent from PeMA ${version}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

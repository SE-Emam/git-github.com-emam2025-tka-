
/**
 * Utility for sharing assessment links via various platforms
 */
export const shareAssessment = {
  /**
   * Generates a sharing link for WhatsApp
   */
  whatsapp: (text: string, url: string) => {
    const message = encodeURIComponent(`${text}\n\n${url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  },

  /**
   * Generates a sharing link for LinkedIn
   */
  linkedin: (url: string) => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  },

  /**
   * Generates a sharing link for Email
   */
  email: (subject: string, body: string) => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  },

  /**
   * Triggers a PDF download using the browser's print functionality
   * Needs optimized print CSS in the component
   */
  pdf: () => {
    window.print();
  },

  /**
   * Generates a shareable URL with a token
   */
  generateUrl: (type: string, id: string, token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/assessments/${type}?id=${id}&token=${token}`;
  }
};

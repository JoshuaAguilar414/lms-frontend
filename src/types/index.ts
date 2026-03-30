export interface TrainingItem {
  /** Used in `/courses/{id}` — prefer Shopify product id; falls back to Mongo course _id */
  id: string;
  title: string;
  progress: string;
  thumbnail: string;
  action: 'get_started' | 'resume' | 'view_certificate';
  /** SCORM package URL (e.g. https://example.com/scorm/package/index.html) or SCORM player admissionId for embedding the course content */
  scormUrl?: string;
  /** Admission ID for SCORM player (if provided, will build scorm-player URL with this admissionId) */
  admissionId?: string;
}

export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

export interface PurchaseItem {
  id: string;
  productName: string;
  thumbnail: string;
  lessons: string;
  status: 'Complete' | 'In Progress' | string;
  level: string;
  detailsHref: string;
}

export interface CourseItem {
  id: string;
  date: string;
  productName: string;
  needHelpHref: string;
  visitPageHref: string;
}

export interface RelatedCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tag: string;
  price: string;
  href: string;
}

'use client';

import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string | null;
}

/**
 * シンプルなSEOコンポーネント
 * クライアントサイドでdocumentのtitleとmeta descriptionを更新します
 */
const SEO: React.FC<SEOProps> = ({ title, description, image }) => {
  useEffect(() => {
    // ページタイトルを更新
    if (title) {
      document.title = title;
    }

    // meta descriptionを更新
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // og:imageを更新
    if (image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', image);
    }
  }, [title, description, image]);

  return null;
};

export default SEO;


























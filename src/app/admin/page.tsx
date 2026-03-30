'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import { api } from '@/lib/api';

type UploadState = {
  loading: boolean;
  success: string | null;
  error: string | null;
};

const initialUploadState: UploadState = {
  loading: false,
  success: null,
  error: null,
};

export default function AdminPage() {
  const [productId, setProductId] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [scormFile, setScormFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [scormUploadState, setScormUploadState] = useState<UploadState>(initialUploadState);
  const [logoUploadState, setLogoUploadState] = useState<UploadState>(initialUploadState);

  const scormDisabled = useMemo(
    () => !productId.trim() || !productTitle.trim() || !scormFile || scormUploadState.loading,
    [productId, productTitle, scormFile, scormUploadState.loading]
  );
  const logoDisabled = useMemo(
    () => !logoFile || logoUploadState.loading,
    [logoFile, logoUploadState.loading]
  );

  async function handleScormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scormFile) return;

    if (!scormFile.name.toLowerCase().endsWith('.zip')) {
      setScormUploadState({
        loading: false,
        success: null,
        error: 'SCORM file must be a .zip file.',
      });
      return;
    }

    setScormUploadState({ loading: true, success: null, error: null });
    try {
      const result = await api.admin.uploadScorm({
        productId: productId.trim(),
        productTitle: productTitle.trim(),
        scormZipFile: scormFile,
      });
      setScormUploadState({
        loading: false,
        success: result?.message || 'SCORM file uploaded successfully.',
        error: null,
      });
      setScormFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload SCORM file.';
      setScormUploadState({ loading: false, success: null, error: message });
    }
  }

  async function handleLogoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!logoFile) return;

    setLogoUploadState({ loading: true, success: null, error: null });
    try {
      const result = await api.admin.uploadLogo(logoFile);
      setLogoUploadState({
        loading: false,
        success: result?.message || 'Logo image uploaded successfully.',
        error: null,
      });
      setLogoFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload logo image.';
      setLogoUploadState({ loading: false, success: null, error: message });
    }
  }

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#00263d]">Admin Panel</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload SCORM ZIP packages with product mapping and upload logo images.
          </p>
        </div>

        <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#00263d]">SCORM Upload</h2>
              <p className="mt-1 text-sm text-gray-600">
                Required fields: product ID, product title, and a SCORM ZIP file.
              </p>
              <form className="mt-5 space-y-4" onSubmit={handleScormSubmit}>
                <div>
                  <label htmlFor="productId" className="mb-1 block text-sm font-medium text-gray-700">
                    Product ID
                  </label>
                  <input
                    id="productId"
                    type="text"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-[#54bd01] transition focus:ring-2"
                    placeholder="e.g. 987654321"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="productTitle" className="mb-1 block text-sm font-medium text-gray-700">
                    Product Title
                  </label>
                  <input
                    id="productTitle"
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-[#54bd01] transition focus:ring-2"
                    placeholder="e.g. ESG Compliance Fundamentals"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="scormFile" className="mb-1 block text-sm font-medium text-gray-700">
                    SCORM ZIP File
                  </label>
                  <input
                    id="scormFile"
                    type="file"
                    accept=".zip,application/zip"
                    onChange={(e) => setScormFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#54bd01] file:px-3 file:py-2 file:text-white hover:file:opacity-90"
                    required
                  />
                </div>
                {scormUploadState.error ? (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{scormUploadState.error}</p>
                ) : null}
                {scormUploadState.success ? (
                  <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{scormUploadState.success}</p>
                ) : null}
                <Button type="submit" disabled={scormDisabled}>
                  {scormUploadState.loading ? 'Uploading SCORM...' : 'Upload SCORM'}
                </Button>
              </form>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#00263d]">Logo Image Upload</h2>
              <p className="mt-1 text-sm text-gray-600">
                Upload your logo image file (PNG, JPG, SVG, WebP).
              </p>
              <form className="mt-5 space-y-4" onSubmit={handleLogoSubmit}>
                <div>
                  <label htmlFor="logoFile" className="mb-1 block text-sm font-medium text-gray-700">
                    Logo Image
                  </label>
                  <input
                    id="logoFile"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-[#54bd01] file:px-3 file:py-2 file:text-white hover:file:opacity-90"
                    required
                  />
                </div>
                {logoUploadState.error ? (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{logoUploadState.error}</p>
                ) : null}
                {logoUploadState.success ? (
                  <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{logoUploadState.success}</p>
                ) : null}
                <Button type="submit" disabled={logoDisabled}>
                  {logoUploadState.loading ? 'Uploading Logo...' : 'Upload Logo'}
                </Button>
              </form>
            </section>
          </div>
        </div>
      </div>
  );
}

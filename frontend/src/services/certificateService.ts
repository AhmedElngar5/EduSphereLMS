import api from './api';
import { Certificate, CertificateVerification } from '../types';

export const certificateService = {
  claimCertificate: async (courseId: number): Promise<Certificate> => {
    const response = await api.post<Certificate>(`/certificates/courses/${courseId}/claim`);
    return response.data;
  },

  getCourseCertificate: async (courseId: number): Promise<Certificate> => {
    const response = await api.get<Certificate>(`/certificates/courses/${courseId}`);
    return response.data;
  },

  getMyCertificates: async (): Promise<Certificate[]> => {
    const response = await api.get<Certificate[]>('/certificates/my-certificates');
    return response.data;
  },

  verifyCertificate: async (certificateNumber: string): Promise<CertificateVerification> => {
    const response = await api.get<CertificateVerification>(`/certificates/verify/${encodeURIComponent(certificateNumber)}`);
    return response.data;
  },

  getDownloadUrl: (certificateNumber: string): string => {
    return `/api/certificates/${encodeURIComponent(certificateNumber)}/download`;
  },
};

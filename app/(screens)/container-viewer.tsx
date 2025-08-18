import React from 'react';
import { ContainerViewer } from '@/components/viewer/ContainerViewer';
import { router } from 'expo-router';

export default function ContainerViewerScreen() {
  const handleClose = () => {
    router.back();
  };

  return <ContainerViewer onClose={handleClose} />;
}
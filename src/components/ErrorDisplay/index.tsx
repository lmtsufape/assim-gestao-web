import React, { useEffect, useState } from 'react';

import { Alert, AlertTitle, Snackbar } from '@mui/material';

interface ErrorDisplayProps {
  errors: string[];
  onClose: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors, onClose }) => {
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (errors.length > 0) {
      setCurrentError(errors[currentIndex]);
    }
  }, [errors, currentIndex]);

  const handleClose = () => {
    if (currentIndex < errors.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentError(null);
      onClose();
    }
  };

  return (
    <Snackbar
      open={currentError !== null}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert variant="filled" severity="error" onClose={handleClose}>
        <AlertTitle>Erro!</AlertTitle>
        {currentError}
      </Alert>
    </Snackbar>
  );
};

export default ErrorDisplay;

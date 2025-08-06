import mongoose from 'mongoose';
import httpStatus from 'http-status';

const handleCastError = (error) => {
  const errors = [
    {
      path: error.path,
      message: 'Invalid ID',
    },
  ];

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Cast Error',
    errorMessages: errors,
  };
};

export default handleCastError;

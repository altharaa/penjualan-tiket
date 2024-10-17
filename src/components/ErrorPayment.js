import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPayment = () => {
    const navigate = useNavigate();

    return (
        <div className='m-10'>
            <h2 className='text-center'>Payment Failed</h2>
            <p className='mt-10 text-center'>An error occurred during your payment. Please try again later.</p>
            <button onClick={() => navigate("/")} className="mt-10 btn btn-danger">
                Return to Home
            </button>
        </div>
    );
};

export default ErrorPayment;

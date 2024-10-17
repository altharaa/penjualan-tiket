import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnfinishedPayment = () => {
    const navigate = useNavigate();

    return (
        <div className='m-10'>
            <h2 className='text-center'>Payment Unfinished</h2>
            <p className='mt-10 text-center'>Your payment process was not completed. Please try again later.</p>
            <button onClick={() => navigate("/")} className="mt-10 btn btn-warning">
                Return to Home
            </button>
        </div>
    );
};

export default UnfinishedPayment;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPayment = () => {
    const navigate = useNavigate();

    return (
        <div className='m-10'>
            <h2 className='text-center'>Payment Successful</h2>
            <p className='mt-10 text-center'>Your payment was completed successfully!</p>
            <button onClick={() => navigate("/")} className="mt-10 btn btn-primary">
                Return to Home
            </button>
        </div>
    );
};

export default SuccessPayment;

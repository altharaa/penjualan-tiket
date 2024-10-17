import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ProductSelector from "./components/ProductSelector"; 
import AddItem from "./components/AddItem"; 
import CheckoutConfirmation from "./components/CheckoutConfirmation";
import UnfinishedPayment from "./components/UnfinishedPayment";
import ErrorPayment from "./components/ErrorPayment";
import SuccessPayment from "./components/SuccessPayment";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ProductSelector />} />
                <Route path="/add-item" element={<AddItem />} />
                <Route path="/checkout" element={<CheckoutConfirmation />} />
                <Route path="/success-payment" element={ <SuccessPayment/> } />
                <Route path="/unfinished-payment" element={ <UnfinishedPayment/> } />
                <Route path="/error-payment" element={ <ErrorPayment/> } />
            </Routes>
        </Router>
    );
};

export default App;

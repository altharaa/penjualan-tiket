import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { product } from "../libs/product"; 
import AddItem from "./AddItem";

const ProductSelector = () => {
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSelection = (event) => {
    setSelectedProduct(event.target.value);
  };

  const handleNextClick = () => {
    if (selectedProduct) {
        const selected = product.find((item) => item.id === parseInt(selectedProduct));
        if (selected) {
            alert(`Produk yang dipilih: ${selected.name}`);
            navigate("/add-item", { state: { selectedProductId: selected.id, amount: selected.price, productName: selected.name } });
        } else {
            alert("Produk tidak ditemukan.");
        }
    } else {
        alert("Silakan pilih produk terlebih dahulu.");
    }
  };

  return (
    <>
        <h2 className="m-10 text-center">Pilih Tiket Konser</h2>
        <div className="m-10 ">
    
        <form>
            {product.map((item) => (
            <div key={item.id} className="container-item mt-3 p-3 border rounded bg-secondary-subtle" style={{ padding: "10px", height: "70px" }}>
                <input
                    style={{ width: "20px", height: "20px" }}
                    className="me-10"
                    type="radio"
                    id={`product-${item.id}`}
                    name="product"
                    value={item.id}
                    onChange={handleSelection}
                    checked={selectedProduct === String(item.id)}
                />
                <label htmlFor={`product-${item.id}`}>
                    {item.name} 
                    <br/>
                    Rp {item.price.toLocaleString()}
                </label>
            </div>
            ))}
        </form>

        {/* {selectedProduct && (
            <div className="selection mt-4 p-3 bg-success-subtle border border-success rounded">
            <h3>Produk yang Dipilih:</h3>
            <p>
                {product.find((item) => item.id === parseInt(selectedProduct)).name}
            </p>
            </div>
        )} */}

        <div className="text-center mt-4">
            <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextClick}
            >
                Next
            </button>
        </div>

        
        </div>
    </>
  );
};

export default ProductSelector;

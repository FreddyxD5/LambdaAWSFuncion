import products from "../../services/products";
import { type Product } from "../../interfaces/products";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";



export default function Home() {

  const addProducts = (product: Product) => {
    const productsCart = JSON.parse(localStorage.getItem("products_cart") || "[]");
    const productCart = []
    product.id = product.id;
    productsCart.push(product);    
    localStorage.setItem("products_cart", JSON.stringify(productsCart));
 
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: '¡Producto Añadido correctamente!',
      showConfirmButton: false,
      background: '#242424',
      color: "#fff",
      timer: 1250
    })

  };


  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/cart");
  };

  return (
    <div>
      <h1 className="center">Lista de productos Pruebita</h1>
      <button onClick={handleClick}>Ir al carrito</button>
      <div className="products">
        {products.map((product: Product) => (
          <div className="card__product" key={product.id}>
            <img src={product.picture_url} alt="" />
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <p>$ {product.unit_price}</p>
            <button onClick={() => addProducts(product)}>Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

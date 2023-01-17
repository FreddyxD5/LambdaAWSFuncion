import { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { type Product } from "../../interfaces/products";
import Swal from "sweetalert2";

export default function Cart() {
  const [products, setProducts] = useState(
    JSON.parse(localStorage.getItem("products_cart") ?? "[]")
  );

  const deleteProducts = (product: Product) => {
    const newProducts = products.filter(
      (productO: Product) => productO.id !== product.id
    );
    setProducts(newProducts);
    // setNum(nItem - 1);
    Swal.fire({
      position: "center",
      icon: "success",
      title: "¡Eliminado!",
      showConfirmButton: false,
      background: "#242424",
      color: "#fff",
      timer: 1250,
    });
  };
  const [pay, setPay] = useState(false);
  const navigate = useNavigate();

  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (products.length == 0) {
      localStorage.removeItem("products_cart");
      setPay(false);
    } else {
      localStorage.setItem("products_cart", JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const mp = new MercadoPago(import.meta.env.VITE_PUBLIC_KEY, {
      locale: 'es-PE'
    });
    const bricksBuilder = mp.bricks();
    const renderCardPaymentBrick = async (bricksBuilder: any) => {
      const settings = {        
        initialization: {
          amount: totalCarrito(), // monto a ser pago
          payer: {
            email: "",
          },
        },
        customization: {
          visual: {
            style: {
              theme: "dark",
            },
          },
        },
        callbacks: {
          onReady: () => {
            // callback llamado cuando Brick esté listo
          },
          onSubmit: (cardFormData: any) => {
            //  callback llamado cuando el usuario haga clic en el botón enviar los datos
            //  ejemplo de envío de los datos recolectados por el Brick a su servidor
            return new Promise<void>((resolve, reject) => {
              //antigua ruta
              //https://rt5x79icca.execute-api.us-east-1.amazonaws.com/default/fn-mercadopago
              //http://127.0.0.1:8000/process_payment/      
              const body_data = {
                dataCard : cardFormData,
                preference:{
                  items: products                  
                }
                
              }
              fetch("https://rt5x79icca.execute-api.us-east-1.amazonaws.com/default/fn-mercadopago", {
                method: "POST",
                mode:"cors",                
                headers: {
                  "Content-Type": "application/json"                  
                },
                body: JSON.stringify(cardFormData),
              })
              .then((response) => response.json()
              ).then(data=> {                                
                console.log('Estado de la respuesta de AWS')
                console.log(data['statusCode'])
                console.log("Datos Enviados del AWS")
                console.log(JSON.parse(data['body']))
                Swal.fire({
                  position: "center",
                  icon: "success",
                  title: "¡Pago Realizado con exito!",
                  showConfirmButton: false,
                  background: "#242424",
                  color: "#fff",
                  timer: 1250,
                });
                
                // console.log(data['data']['sandbox_init_point'])
                // window.location.replace(data['data']['sandbox_init_point'])                
                // window.location.replace(data['body']['sandbox_init_point'])
              })
                .catch((error) => {
                  // tratar respuesta de error al intentar crear el pago

                  reject();
                });
            });
          },
          onError: (error: any) => {
            // callback llamado para todos los casos de error de Brick
          },
        },
      };
      window.cardPaymentBrickController = await bricksBuilder.create(
        "cardPayment",
        "cardPaymentBrick_container",
        settings
      );
    };
    renderCardPaymentBrick(bricksBuilder);
  }, []);

  const handleClick = () => {
    navigate("/");
  };

  const totalCarrito = () =>{
    let total = 0
    if (products.length !=0 ){

        products.map((product:Product) =>{          
          total += product.unit_price
      })
    }
    return total
  }

  const hidePay = () => {
    pay ? setPay(false) : setPay(true);
  };
  return (
    <div>
      <h1 className="center">Carrito de compras</h1>
      <button onClick={handleClick} type="button">
        Retornar
      </button>
      {products.length != 0 ? <button onClick={hidePay}>Pagar</button> : null}
      {products.length == 0 ? (
        <div className="noProduct">No hay productos añadidos</div>
      ) : null}
      <div className="products">
        {products.map((product: Product) => (
          <div className="card__product" key={product.id}>
            <img src={product.picture_url} alt="" />
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <p>$ {product.unit_price}</p>
            <button onClick={() => deleteProducts(product)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="card__product">
        <h2>En total Tiene {products.length} productos en su carrito</h2>
        <h2>Total en S/. ${totalCarrito()}</h2>        
      </div>
      <div
        id="cardPaymentBrick_container"
        style={{ display: pay ? "block" : "none" }}
      ></div>
    </div>
  );
}


// {
//   'token': 'f091d1882ca27abb099189c185fb7e17',
//   'issuer_id': '12347',
//   'payment_method_id': 'master',
//   'transaction_amount': 179, 'installments': 1, 'payer': {'email': 'freddyxd5@gmail.com', 'identification': {'type': 'DNI', 'number': '62556582'}}}

// preference:{
//   token : bodyGet['token']
// }
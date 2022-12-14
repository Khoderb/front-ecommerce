import { useState, useEffect } from "react"
import { format } from "../helpers/helpers"
import useCart from '../hooks/useCart'
import useAuth from '../hooks/useAuth'
import axiosClient from "../config/axiosClient"
import Alert from "./Alert"
import { useNavigate } from "react-router-dom"
import useProducts from "../hooks/useProducts"


const Summary = () => {
//Hooks

const { cartList, clearCartList } = useCart();
const { showAlert, alert } = useProducts();
const { auth } = useAuth();
const [total, setTotal] = useState(0);


useEffect( ()=> {
    const newTotal = cartList.reduce((total, item) => total + item.price * item.quantity, 0);
    setTotal(newTotal);
},[cartList])    

const navigate = useNavigate();
//Functions 

const setStock = orderedProducts  => {
    orderedProducts.forEach( item => {
        cartList.forEach( async itemCL => {
            if(itemCL._id === item.id ){
                await axiosClient.put(`/products/${itemCL._id}`, {stock: (item.stock - itemCL.quantity)})
            }
        });
    });
}

const handleOrder = async () => {
    const order = {
        buyer : {
            //Datos del usuario autenticado
            name: auth.name,
            email: auth.email,
            phone:auth.phone,
            address: auth.address
        },
        products : cartList.map(item => ({
            name: item.name,
            price: item.price,
            qty: item.quantity,
            id: item._id,
            stock:item.stock
        })),
        date: (new Date()).toLocaleString(),
        total: format(total)
    }  
    try {
        console.log(order);
        const { data } = await axiosClient.post("/cart", order);
        showAlert({msg:data.msg, error: false});
        setStock(order.products);
        setTimeout(() => {
            clearCartList();
            navigate("/products");
        }, 3000);
    }catch(err){
        console.log(' Order catch ', err) 
    }
} 

    const { msg } = alert;
    return (
        <div className=" animate summary shadow-md flex w-1/5 items-center gap-4 flex-col rounded-lg">
             {msg && <div className="w-full mb-3">
                        <Alert alert={alert}/>
                    </div>}
           <h1 className="font-bold text-3xl letter-space">Summary</h1>
            <p>Subtotal:{' '}<span className="font-bold">{format(total)}</span></p>
            <p>Taxes:{' '}<span className="font-bold">{format(total*0.11)}</span></p>
            <p>Discount:{' '}<span className="font-bold">{format(total*0.11*-1)}</span></p>
            <p className="text-2xl font-black  ">Total:{' '}<span className="font-bold text-md">{format(total)}</span></p>
            <button className=" bg-emerald-400 hover:bg-emerald-500 font-bold mb-2 w-full p-2 shadow rounded-lg" 
                    onClick={handleOrder}>Checkout now</button>
        </div>
    )
}

export default Summary

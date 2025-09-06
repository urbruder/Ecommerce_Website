import { React,createContext,useEffect,useState } from "react";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext= createContext();
const ShopContextProvider=(props)=>{
    const currency='$';
    const delivery_fee=10;
    const backendUrl=import.meta.env.VITE_BACKEND_URL;
    const [search,setSearch]=useState('');
    //this will be used to search products
    //if we set this to '' it will show all products otherwise it will filter products based
    const [showSearch,setShowSearch]=useState(false);
    //if we set this to true, it will show the search bar otherwise it will not show the search bar
    const [cartItems,setCartItems]=useState({});
    const [products,setProducts]=useState([]);
    const [token,setToken]=useState('')
    const navigate=useNavigate();




const addToCart = async (itemId, size) => {
    // Step 1: Check if size is selected
    if (!size) {
        toast.error('Select Product Size');
        return;
    }

    // Step 2: Deep clone the cartItems state to avoid direct mutation
    let cartData = structuredClone(cartItems);

    // Step 3: Check if itemId exists in the cart
    if (cartData[itemId]) {
        // Step 3a: If size already exists, increment the quantity
        if (cartData[itemId][size]) {
            cartData[itemId][size] += 1;
        } else {
            // Step 3b: If size doesn't exist, set initial quantity to 1
            cartData[itemId][size] = 1;
        }
    } else {
        // Step 4: If itemId doesn't exist, create a new entry with size and quantity 1
        cartData[itemId] = {};
        cartData[itemId][size] = 1;
    }

    // Step 5: Update the cartItems state with the new cart data
    setCartItems(cartData);

    if (token) {
        try {
            await axios.post(backendUrl + '/api/cart/add',{itemId, size},{headers:{token}})
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }
};
//This function gives us the count of total products in cart.
   const getCartCount=()=>{
    let totalCount=0;
    for(const items in cartItems){
        for(const item in cartItems[items]){
            try {
                if(cartItems[items][item]>0){
                    totalCount+=cartItems[items][item];
                }
            } catch (error) {
                
            }
        }
    }
    return totalCount;
   }

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    if (quantity === 0) {
        // Remove that size
        delete cartData[itemId][size];
        // If no sizes left, remove the item
        if (Object.keys(cartData[itemId]).length === 0) {
            delete cartData[itemId];
        }
    } else {
        cartData[itemId][size] = quantity;
    }

    setCartItems(cartData);

    if(token){
        try {
            await axios.post(backendUrl+'/api/cart/update',{itemId,size,quantity},{headers:{token}})
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
};


   const getCartAmount= () =>{
    let totalAmount=0;
    for(const items in cartItems){
        let itemInfo =products.find((product)=>product._id===items);
        for(const item in cartItems[items]){
            try {
                if(cartItems[items][item]>0){
                    totalAmount+=itemInfo.price * cartItems[items][item];
                }
            } catch (error) {
                
            }
        }
    }
    return totalAmount
   }


    const getProductsData= async ()=>{
        try {
            const response =await axios.get(backendUrl+'/api/product/list')
           if(response.data.success){
            setProducts(response.data.products)
           }
           else{
            toast.error(response.data.message)
           }
        } catch (error) {
           toast.error(error.message)            
        }
    }

     const getUserCart=async(token)=>{
        try {
            const response=await axios.post(backendUrl+'/api/cart/get',{},{headers:{token}})

            if(response.data.success){
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
     }

    useEffect(()=>{
        getProductsData()
    },[])
    

    useEffect(()=>{
         if(!token && localStorage.getItem('token')){
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
         }
    },[])


    const value={
        products,currency,delivery_fee,
        search,setSearch,showSearch,setShowSearch,cartItems,addToCart,
        getCartCount,updateQuantity,getCartAmount,navigate, backendUrl,setToken,token,setCartItems
    }
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
} 
export default ShopContextProvider;
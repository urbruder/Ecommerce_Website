import { React,createContext,useEffect,useState } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";
export const ShopContext= createContext();
const ShopContextProvider=(props)=>{
    const currency='$';
    const delivery_fee=10;
    const [search,setSearch]=useState('');
    //this will be used to search products
    //if we set this to '' it will show all products otherwise it will filter products based
    const [showSearch,setShowSearch]=useState(false);
    //if we set this to true, it will show the search bar otherwise it will not show the search bar
    const [cartItems,setCartItems]=useState({});




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

 
    const value={
        products,currency,delivery_fee,
        search,setSearch,showSearch,setShowSearch,cartItems,addToCart,
        getCartCount
    }
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
} 
export default ShopContextProvider;
import { React,createContext,useState } from "react";
import { products } from "../assets/assets";
export const ShopContext= createContext();
const ShopContextProvider=(props)=>{
    const currency='$';
    const delivery_fee=10;
    const [search,setSearch]=useState('');
    //this will be used to search products
    //if we set this to '' it will show all products otherwise it will filter products based
    const [showSearch,setShowSearch]=useState(false);
    //if we set this to true, it will show the search bar otherwise it will not show the search bar
    const value={
        products,currency,delivery_fee,
        search,setSearch,showSearch,setShowSearch
    }
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
} 
export default ShopContextProvider;
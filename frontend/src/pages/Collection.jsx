import React, { useContext,useState,useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Footer from '../components/Footer';
import { assets } from '../assets/assets';
import Title from '../components/Title'
import ProductItem from '../components/ProductItem';
const Collection = () => {
const {products, search , showSearch}=useContext(ShopContext);
const [showFilter,setShowFilter]=useState(false)
const [filterProducts, setFilterProducts]=useState([])
const [category, setCategory]=useState([])
const [subCategory,setSubCategory]=useState([])
const [sortType,setSortType]=useState('relevant');
const toggleCategory=(e)=>{
  if(category.includes(e.target.value)){
    setCategory(prev=>prev.filter(item=>item!==e.target.value))
  }
  else{
    setCategory(prev=>[...prev,e.target.value])
  }
}
//When the site loads, it will show all products
// This will happen when we open the collection page for the first time
const toggleSubCategory=(e)=>{
  // This function will toggle the subCategory state
  // It will check if the subCategory already exists in the state 
  //e.target.value is the value of the checkbox that is clicked
  // If it exists, it will remove it from the state
  if(subCategory.includes(e.target.value)){
    setSubCategory(prev=>prev.filter(item=>item!==e.target.value))
  }
  //e.target.value means the value of checkbox if it is checked or not.
  else{
    // If e.target.value doesn't exist, it will add it to the state
    //...prev means the previous state of subCategory
    // It will create a new array with the previous state and the new value
    setSubCategory(prev=>[...prev,e.target.value])
  }
}
  // // Function to apply filter based on category and subCategory
  // This function will be called whenever category or subCategory changes
  // It will filter the products based on the selected category and subCategory
 const applyFilter=()=>{
  let productsCopy=products.slice()
// This will create a shallow copy of the products array
//if we don't select any filter, it will show all products.
// This will happen when we open the collection page for the first time
//slice() method returns a shallow copy of a portion of an array into a new array object
  if(showSearch && search){
    // If search is true and search is not empty, it will filter products based on search
    // This will filter products that match the search term
    //.toLowerCase() method converts a string to lowercase letters
    // This will make the search case-insensitive
    // This will filter products that match the search term and check if the name of the product includes the search term
    productsCopy=productsCopy.filter(item=>item.name.toLowerCase().includes(search.toLowerCase()))
  }
  if(category.length>0){
    productsCopy=productsCopy.filter(item=>category.includes(item.category));
  }
  if(subCategory.length>0){
    // If subCategory is selected, filter products based on subCategory
    // This will filter products that match the selected subCategory
    //.filter() method creates a new array with all elements that pass the test implemented by the provided function.
    productsCopy=productsCopy.filter(item=>subCategory.includes(item.subCategory))
  }
  console.log("filteredProducts:",productsCopy)//Checking if after applying filter ,products are coming or not
  //Setting the filtered products to filterProducts state
  //This will re-render the component and show the filtered products
  //If no filter is applied, it will show all products
  setFilterProducts(productsCopy)
 }
 useEffect(()=>{
    applyFilter();
 },[category,subCategory,search,showSearch,products])

// Logic for Filtering product ends here

const sortProducts=()=>{
  // This function will sort the products based on the selected sort type
  // It will create a copy of the filterProducts array and sort it based on the selected
  let fpCopy=filterProducts.slice();
  switch(sortType){
    case 'low-high':
      setFilterProducts(fpCopy.sort((a,b)=>(a.price-b.price)));
      // This will sort the products in ascending order based on price
      // It will compare the price of two products and return the difference
      // If the difference is negative, it will place the first product before the second product
     break;
    case 'high-low':
      setFilterProducts(fpCopy.sort((a,b)=>(b.price-a.price)));
      // This will sort the products in descending order based on price
      // It will compare the price of two products and return the difference
      // If the difference is positive, it will place the first product before the second product
      break;
     default:
      applyFilter();
      // If no sort type is selected, it will apply the filter
      // This will show all products without any sorting
      break; 
  }
}
useEffect(()=>{
  sortProducts();
},[sortType]);
//Logic for sorting products ends here

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filter Option */}
      <div className='min-w-60'>
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img  className={`h-3 sm:hidden ${showFilter ? "rotate-90" : "" }`} src={assets.dropdown_icon} alt="" />
        </p>
        {/* Category filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? "" : "hidden"} sm:block`}>
           <p className='mb-3 text-sm font-medium '>CATEGORIES</p>
           <div className='flex flex-col gap-2 text-sm font-light text-gray-700' >
            <p className='flex gap-2'>
              <input className='w-3 ' type="checkbox" value={'Men'} onChange={toggleCategory} /> Men
            </p>
             <p className='flex gap-2'>
              <input className='w-3 ' type="checkbox" value={'Women'} onChange={toggleCategory} /> Women
            </p>
             <p className='flex gap-2'>
              <input className='w-3 ' type="checkbox" value={'Kids'} onChange={toggleCategory} /> Kids
            </p>

           </div>
        </div>
         {/* Sub-category Filter */}
         <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? "" : "hidden"} sm:block`} >
            <p className='mb-3 text-sm font-medium '>TYPE</p>
           <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3 ' type="checkbox" value={'Topwear'} onChange={toggleSubCategory} /> Topwear
            </p>
             <p className='flex gap-2'>
              <input className='w-3 ' type="checkbox" value={'Bottomwear'} onChange={toggleSubCategory} /> Bottomwear
            </p>
             <p className='flex gap-2'>
              <input className='w-3 ' type="checkbox" value={'Winterwear'} onChange={toggleSubCategory} /> Winterwear
            </p>

           </div>
         </div>
      </div>
      {/* Right Side */}
      <div className='flex-1'>
         <div className='flex justify-between text-base sm:text 2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'}/>
          {/* Sorting of product */}
          <select onChange={(e)=>setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2' >
               <option value="relevant">Sort by: Relevant</option>
               <option value="low-high">Sort by: Low to High</option>
               <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>


        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid col-3 lg:grid-cols-4 gap-4 gap-y-6'>
            {
              filterProducts.map((item,index)=>(
                <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image}/>
              ))
            } 
        </div>
      </div>
    </div>
  )
}

export default Collection

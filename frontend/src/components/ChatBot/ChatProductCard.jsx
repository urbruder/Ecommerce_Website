import React, { useContext, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { assets } from '../../assets/assets';

const ChatProductCard = ({ product }) => {
  const { currency, navigate } = useContext(ShopContext);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!product) return null;

  const imageUrl = Array.isArray(product.image) ? product.image[0] : product.image;
  const showSaleBadge = product.bestseller;

  return (
    <div
      className='bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer'
      onClick={() => navigate(`/product/${product._id}`)}
      role="article"
      aria-label={`Product: ${product.name}`}
      id={`chatbot-product-${product._id}`}
    >
      <div className='flex gap-3 p-3'>
        {/* Product Image */}
        <div className='w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 relative'>
          {!imgLoaded && (
            <div className='absolute inset-0 chatbot-img-placeholder rounded-lg' />
          )}
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          {showSaleBadge && (
            <span className='absolute top-1 left-1 bg-black text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full'>
              BEST
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className='flex-1 min-w-0 flex flex-col justify-between'>
          <div>
            <p className='text-xs font-medium text-gray-800 leading-snug line-clamp-2'>
              {product.name}
            </p>
            <div className='flex items-center gap-1 mt-1'>
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={assets.star_icon} alt="" className='w-2.5' />
              ))}
              <img src={assets.star_dull_icon} alt="" className='w-2.5' />
            </div>
          </div>

          <div className='flex items-center justify-between mt-1.5'>
            <p className='text-sm font-semibold text-gray-900'>
              {currency}{product.price}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product._id}`);
              }}
              className='text-[10px] font-medium bg-black text-white px-3 py-1 rounded-full hover:bg-gray-800 transition-colors duration-200'
              aria-label={`View ${product.name}`}
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatProductCard);

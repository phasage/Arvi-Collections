import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  const { user } = useAuthStore()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setProduct(data.data)
      } else {
        setError('Product not found')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login')
      return
    }

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      quantity: quantity
    })

    // Show success message (you can implement a toast notification)
    alert('Product added to cart!')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
        <button 
          onClick={() => navigate('/products')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to Products
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
            <img 
              src={product.images?.[selectedImage]?.url || '/placeholder-product.jpg'} 
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={image.url} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600">{product.shortDescription}</p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-primary-600">${product.price}</span>
            {product.comparePrice && (
              <span className="text-xl text-gray-500 line-through">${product.comparePrice}</span>
            )}
            {product.onSale && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                Sale
              </span>
            )}
          </div>

          {product.quantity > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.quantity} available
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-red-600 font-medium">Out of Stock</span>
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
              >
                Unavailable
              </button>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Product Details</h3>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>{product.description}</p>
            </div>
          </div>

          {product.brand && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2">Brand</h3>
              <p className="text-gray-600">{product.brand}</p>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
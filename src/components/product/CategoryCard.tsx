import React from 'react'
import { Link } from 'react-router-dom'
import { Category } from '../../lib/supabase'
import { ArrowRight } from 'lucide-react'

interface CategoryCardProps {
  category: Category
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={`/products?category=${category.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      <div className="relative overflow-hidden">
        <img
          src={category.image_url || '/placeholder-category.jpg'}
          alt={category.name}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {category.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {category.description}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  )
}
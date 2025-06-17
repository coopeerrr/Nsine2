import React from 'react'

interface LoadingSkeletonProps {
  className?: string
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  )
}

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <LoadingSkeleton className="h-48 w-full" />
      <div className="p-4">
        <LoadingSkeleton className="h-4 w-3/4 mb-2" />
        <LoadingSkeleton className="h-3 w-1/2 mb-3" />
        <LoadingSkeleton className="h-6 w-1/4" />
      </div>
    </div>
  )
}

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <LoadingSkeleton className="h-32 w-full" />
      <div className="p-4">
        <LoadingSkeleton className="h-5 w-3/4 mb-2" />
        <LoadingSkeleton className="h-3 w-full" />
      </div>
    </div>
  )
}
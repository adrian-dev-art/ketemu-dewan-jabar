"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingSystemProps {
  onRatingSubmit: (rating: number, comment: string) => void;
}

export default function RatingSystem({ onRatingSubmit }: RatingSystemProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Beri penilaian pengalaman Anda</h3>
      
      <fieldset className="mb-6">
        <legend className="sr-only">Pilih rating dari 1 sampai 5 bintang</legend>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={star}
                className="sr-only"
                onClick={() => setRating(star)}
                required
              />
              <Star
                size={32}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className={`transition-colors ${
                  (hover || rating) >= star 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300 dark:text-zinc-600'
                }`}
                aria-hidden="true"
              />
              <span className="sr-only">{star} Bintang</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bagikan masukan Anda (Opsional)
        </label>
        <textarea
          id="comment"
          rows={3}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bagaimana diskusi tadi berjalan?"
        />
      </div>

      <button
        onClick={() => onRatingSubmit(rating, comment)}
        disabled={rating === 0}
        className={`w-full font-bold py-2 rounded-lg transition-colors focus:ring-4 focus:outline-none ${
          rating === 0 
            ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
            : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-300 dark:focus:ring-green-900'
        }`}
      >
        Kirim Penilaian
      </button>
    </div>
  );
}
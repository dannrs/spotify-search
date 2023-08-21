'use client'

import { useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import JaroWinkler from '@/lib/jaro'
import { Result } from '@/lib/types'
import { fetcher } from '@/lib/utils'
import Link from 'next/link'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchType, setSearchType] = useState<string>('artist')
  const { data: searchResults, error } = useSWR(
    searchQuery ? `/api/search?q=${searchQuery}&type=${searchType}` : null,
    fetcher
  )

  if (error) return <div>Failed to load. Please try again.</div>

  const sortedResults = searchResults?.results
    .map((result: Result) => ({
      ...result,
      similarity: JaroWinkler(
        searchQuery.toLowerCase(),
        result.name.toLowerCase()
      )
    }))
    .sort((a: Result, b: Result) => b.similarity - a.similarity)
    .map(({ name, image, url, type }: Result) => ({ name, image, url, type }))

  return (
    <main className='max-w-[60rem] py-4'>
      <section className='flex flex-col items-center justify-center gap-4'>
        <h1 className='text-xl font-semibold'>Spotify Search</h1>
        <div className='flex items-center justify-center gap-2'>
          <Input
            type='text'
            placeholder='Search...'
            value={searchQuery}
            className='w-[30rem]'
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Select defaultValue='artist' onValueChange={setSearchType}>
            <SelectTrigger className='w-32'>
              <SelectValue placeholder='Select a type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='album'>Album</SelectItem>
              <SelectItem value='artist'>Artist</SelectItem>
              <SelectItem value='playlist'>Playlist</SelectItem>
              <SelectItem value='track'>Track</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {searchQuery && (
          <>
            {!sortedResults ? (
              <div>Loading...</div>
            ) : (
              <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                {sortedResults.map((result: Result, index: number) => (
                  <div
                    key={index}
                    className='relative flex flex-col rounded-sm bg-accent p-4'
                  >
                    <Image
                      src={result.image}
                      alt={result.name}
                      width={640}
                      height={640}
                    />
                    <p className='pt-4 text-lg'>{result.name}</p>
                    <p className='text-foreground/80'>
                      {result.type.charAt(0).toUpperCase() +
                        result.type.slice(1)}
                    </p>
                    <Link
                      href={result.url}
                      target='_blank'
                      className='absolute inset-0'
                    >
                      <span className='sr-only'>Open on Spotify</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

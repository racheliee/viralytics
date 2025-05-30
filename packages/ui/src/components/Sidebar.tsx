'use client'

import { AiFillAliwangwang } from 'react-icons/ai'
import Link from 'next/link'
import { FC } from 'react'
import { useTab } from '../hooks/useTab'
import { TabsEnum } from '../constants/tabs'
import { ThemeToggle } from '@viralytics/components/Theme/ThemeToggle'

export interface SidebarProps {
  readonly visible: boolean
}

export const Sidebar: FC<SidebarProps> = ({ visible }) => {
  const { tab } = useTab()

  const navItems = Object.values(TabsEnum).map((tab) => ({
    href: `/dashboard/${tab}`,
    name: tab
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }))

  return (
    <div
      className={`${
        visible ? 'flex' : 'hidden md:flex'
      } flex-col w-64 h-screen bg-gray-100 dark:bg-gray-950 dark:text-white p-4 justify-between`}
    >
      <div>
        <div className="flex flex-row gap-2 items-center justify-left my-4 mx-2">
          <AiFillAliwangwang className="size-10 fill-black dark:fill-white" />
          <h2 className="font-bold text-xl text-black dark:text-white">
            Viralytics
          </h2>
        </div>
        <hr className="my-4 mx-2 border-gray-300" />
        <ul className="font-semibold mx-2 flex gap-2 flex-col">
          {navItems.map((item) => {
            const isActive = tab === item.href.split('/').pop()
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`hover:text-blue-500 dark:hover:text-blue-400 ${
                    isActive
                      ? 'text-blue-600 font-bold dark:text-blue-500'
                      : 'text-gray-700 dark:text-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="flex flex-col items-start justify-center mb-1">
        <ThemeToggle />
      </div>
    </div>
  )
}

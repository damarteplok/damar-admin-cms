import React from 'react'
import { useTranslation } from 'react-i18next'

export function LangSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation()
  const current = i18n.language || 'en'

  const change = (lng: string) => {
    void i18n.changeLanguage(lng)
  }

  return (
    <select
      className={className}
      value={current}
      onChange={(e) => change(e.target.value)}
      aria-label="Language switcher"
    >
      <option value="en">English</option>
      <option value="id">Bahasa Indonesia</option>
    </select>
  )
}

export default LangSwitcher

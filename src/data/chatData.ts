import type { LanguageMode } from '../types/sehatara'

const localizedChatStarterPrompts: Record<LanguageMode, string[]> = {
  id: [
    'Saya bingung harus mulai dari mana menjelaskan keluhan saya',
    'Apa yang perlu saya siapkan sebelum ke dokter?',
    'Tolong jelaskan istilah kesehatan ini dengan bahasa sederhana',
  ],
  en: [
    'I am not sure where to start explaining my symptoms',
    'What should I prepare before seeing a doctor?',
    'Please explain this health term in simple language',
  ],
}

export function getChatStarterPrompts(language: LanguageMode) {
  return localizedChatStarterPrompts[language]
}

export const chatStarterPrompts = getChatStarterPrompts('id')

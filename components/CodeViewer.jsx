'use client'
import { useChatStore } from '@/store/chatStore'
import { Minimize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Sandpack from './Sandpack'

export default function CodeViewer() {
  const { codeViewerContent, isCodeViewerOpen, setIsCodeViewerOpen } = useChatStore()

  return (
    <AnimatePresence>
      {isCodeViewerOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative h-full w-full p-4"
          >
            <button
              onClick={() => setIsCodeViewerOpen(false)}
              className="absolute right-6 top-6 z-10 rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700"
            >
              <Minimize2 className="h-6 w-6" />
            </button>
            <div className="h-full overflow-auto rounded-lg bg-white p-6">
              <Sandpack content={codeViewerContent} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

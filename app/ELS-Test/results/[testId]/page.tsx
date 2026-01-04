'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { authFetch } from '@/lib/api'
import { motion } from 'framer-motion'
import { ChevronRight, MessageCircle, TrendingUp } from 'lucide-react'
import { SarthiButton } from '@/components/ui/sarthi-button'

export default function ElsTestResultsPage() {
  const params = useParams()
  const router = useRouter()

  // ✅ Try to get testId from different possible param names
  const testId = (params.testId || params.id) as string
  
  const [loading, setLoading] = useState(true)
  const [testData, setTestData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTestDetails = async () => {
      // ✅ Add logging to debug
      console.log('Params:', params)
      console.log('Test ID:', testId)
      
      if (!testId) {
        setError('No test ID provided')
        setLoading(false)
        return
      }

      try {
        console.log('Fetching test details for ID:', testId)
        const res = await authFetch(`/api/emotional-test/admin/tests/${testId}`)
        const data = await res.json()
        
        console.log('API Response:', data)

        if (data.success) {
          setTestData(data.data)
        } else {
          setError(data.message || 'Failed to load test results')
        }
      } catch (err) {
        setError('Error loading test results')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTestDetails()
  }, [testId, params]) // ✅ Added params to dependency array

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case "Green": return "from-green-500 to-emerald-500";
      case "Yellow": return "from-yellow-500 to-orange-500";
      case "Orange": return "from-orange-500 to-yellow-600";
      case "Red": return "from-red-500 to-rose-500";
      case "Red+": return "from-red-700 to-red-900";
      default: return "from-gray-500 to-gray-700";
    }
  };

  const getZoneBgColor = (zone: string) => {
    switch (zone) {
      case "Green": return "bg-green-500";
      case "Yellow": return "bg-yellow-500";
       case "Orange": return "bg-orange-500"; 
      case "Red": return "bg-red-500";
      case "Red+": return "bg-red-700";
      default: return "bg-gray-500";
    }
  };


  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#121212] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white mb-2 text-sm sm:text-base">Loading test results...</p>
          <p className="text-white/40 text-xs">Test ID: {testId || 'Not found'}</p>
        </div>
      </div>
    )
  }

  if (error || !testData) {
    return (
      <div className="min-h-[100dvh] bg-[#121212] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-sm sm:text-base">{error || 'Test not found'}</p>
          <p className="text-white/40 text-xs">Test ID: {testId || 'undefined'}</p>
          <SarthiButton onClick={() => router.push('/onboarding')}>
            Go Back
          </SarthiButton>
        </div>
      </div>
    )
  }

  const zone = testData.els_zone
  const zoneColor = getZoneColor(zone)
  const zoneBgColor = getZoneBgColor(zone)

  return (
    <div className="min-h-[100dvh] bg-[#121212] flex items-center justify-center p-4 sm:p-6 safe-bottom">
      <div className="max-w-3xl w-full space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-4 sm:p-6 md:p-8"
        >
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl font-normal text-white text-center mb-6 sm:mb-8"
          >
            Your Emotional Load Test Results
          </motion.h2>

          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              className={`w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto rounded-full bg-gradient-to-br ${zoneColor} flex items-center justify-center mb-4 sm:mb-6`}
            >
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-normal text-white"
                >
                  {Math.round(testData.els_score)}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-white/90 text-sm sm:text-base mt-1 sm:mt-2 font-normal"
                >
                  Stress Level
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className={`inline-block px-4 py-1.5 sm:px-6 sm:py-2 rounded-full ${zoneBgColor} text-white font-normal text-base sm:text-lg mb-2 sm:mb-3`}
            >
              {zone} Zone
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-white/70 text-xs sm:text-sm max-w-xl mx-auto px-4"
            >
              Taken on {new Date(testData.created_at).toLocaleDateString("en-IN", {
                month: "long",
                day: "numeric",
                year: "numeric"
              })}
            </motion.p>
          </div>

          {testData.domain_scores && testData.domain_scores.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/5 mb-4 sm:mb-6"
            >
              <h3 className="text-white font-normal text-base sm:text-lg mb-3 sm:mb-4">Top Stress Areas</h3>
              <div className="space-y-3 sm:space-y-4">
                {testData.domain_scores.map((driver: any, idx: number) => {
                  const percentage = (driver.score / testData.weighted_score) * 100
                  return (
                    <div key={driver.domain}>
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-white/90 text-xs sm:text-sm">{driver.domain}</span>
                        <span className="text-white/60 text-xs sm:text-sm">{Math.round(driver.score)}</span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 1.3 + idx * 0.1 }}
                          className={`h-full bg-gradient-to-r ${
                            idx === 0 ? 'from-red-500 to-orange-500' : 'from-yellow-500 to-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <SarthiButton
              onClick={() => router.push('/chat')}
              className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white text-black rounded-xl font-normal transition-all flex items-center justify-center gap-2 text-base sm:text-lg"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              Talk to Sarthi
            </SarthiButton>
            
            <SarthiButton
              variant="secondary"
              onClick={() => router.push('/ELS-Test')}
              className="w-full sm:flex-1"
            >
              Take Test Again
            </SarthiButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
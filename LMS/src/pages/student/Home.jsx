import React from 'react'
import CallToAction from '../../Components/student/CallToAction'
import Companies from '../../Components/student/Companies'
import CoursesSection from '../../Components/student/CoursesSection'
import Footer from '../../Components/student/footer'
import Hero from '../../Components/student/hero'
import TestimnonialSection from '../../Components/student/testimnonialSection'
const Home = () => {
  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
      <Hero />
      <Companies/>
      <CoursesSection/>
      <TestimnonialSection/>
      <CallToAction/>
      <Footer/>
    </div>
  )
}

export default Home

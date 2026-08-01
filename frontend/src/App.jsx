import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import Home from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'
import About from './pages/About'
import Saved from './pages/Saved'
import NotFound from './pages/NotFound'

export default function App() { return <div className="flex min-h-screen flex-col dark:bg-[#121914]"><Header/><div className="flex-1"><Routes><Route path="/" element={<Home/>}/><Route path="/article/:id" element={<ArticleDetail/>}/><Route path="/about" element={<About/>}/><Route path="/saved" element={<Saved/>}/><Route path="*" element={<NotFound/>}/></Routes></div><Footer/><BottomNav/></div> }

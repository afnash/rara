'use client';import{useEffect}from'react';export default function ClearDummySession(){useEffect(()=>{localStorage.removeItem('rara_dummy_session')},[]);return null}

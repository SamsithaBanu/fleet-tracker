'use client'

import { createContext, useContext, useEffect, useState } from "react";
import {useRouter} from 'next/navigation';
import {authApi} from '../lib/orderApi'

const AuthContext =createContext();

export const AuthProvider =({children})=>{
    const router = useRouter();
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if(stored && token){
            setUser(JSON.parse(stored));
        }
        setLoading(false);
    },[]);


    const login = async(email, password)=>{
        const data = await authApi.login(email, password);

        if(data?.success){
           localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      setUser(data.data.user)
    }

    return data
    }
const logout = async () => {
    try { await authApi.logout() } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

    return(
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAdmin: user?.role === 'admin',
            isDriver: user?.role === 'driver',
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=> useContext(AuthContext)
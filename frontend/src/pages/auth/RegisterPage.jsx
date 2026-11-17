import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, ArrowRight, LoaderCircle, Lock, Eye, EyeOff, UserRound, Mail } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error, setError, errorMsg } = useAuth();
  const navigate = useNavigate();

  const [formDetails, setFormDetails] = useState({
    name:"",
    email:"",
    password:""
  })

{/* form Submission */}
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formDetails, "formDetails")
     const success = await register(formDetails);
     if(success){
        navigate("/", {replace:true})
     }

  /*
    try {
      await register(formDetails);
      navigate('/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
      */
  };

  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-16 sm:px-8">
      <div className="w-full max-w-110 rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-900/5">

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <ShoppingBag size={26} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Create Account</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Join ShopSphere for seamless ordering and tracking
          </p>
        </div>

        {/* Form */}
        <form id="register-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Full Name
                <p className='text-red-500 text-sm md:text-base ml-1'>*</p>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400">
                <UserRound size={18} />
              </span>
              <input
                type="text"
                required
                value={formDetails.name}
                minLength={3}
                onChange={(e) => setFormDetails({
                  ...formDetails,
                  name: e.target.value
                })}
                placeholder="e.g. Satchin Tendulkar"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/*  Email */}
          <div>
            <label className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Email Address
              <p className='text-red-500 text-sm md:text-base ml-1'>*</p>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={formDetails.email}
                onChange={(e) => {setFormDetails({
                  ...formDetails,
                  email: e.target.value
                }), setError(false)}}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor='password' className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Password
                <p className='text-red-500 text-sm md:text-base ml-1'>*</p>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formDetails.password}
                onChange={(e) => {
                    setFormDetails({
                      ...formDetails,
                      password: e.target.value
                    }),
                    setError(false)
                  }}
                placeholder="Create your password"
                className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {/* password show/hide */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

            </div>
          </div>

        {/* error message */}
          {error &&
          <div className='py-1.5 px-2 text-center text-base md:text-base flex items-center justify-center w-full bg-red-200 border border-red-400 rounded'>
              <p className='text-blue-950'>{errorMsg}</p>
          </div>
          }

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white shadow-xl shadow-blue-600/25
            hover:bg-blue-500 transition-all duration-200 ease-in disabled:opacity-80 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Creating..
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign Up
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </span>
            )}
          </button>

        </form>
        {/* login link */}
        {loading ? (
          <p className="mt-6 text-center text-sm text-slate-500">
            Creating your account, please wait...
          </p>
        ) : ( <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Sign in
          </Link>
          </p>
          )
        }

      </div>
    </div>
  );
}
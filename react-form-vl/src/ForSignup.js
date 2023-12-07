import React from 'react';
import useForm from './useForm';
import validat from './validateInfo';
import './Form.css'

const ForSignUp = () => {
    const {handleChange, values, handleSubmit, errors} = useForm(validat);

  return (
    <div className='form-right'>
        <form className='form' 
        onSubmit={handleSubmit} >
            <h1>Register With Us</h1>
            <div className='form-inputs'>
                <label 
                htmlFor='username' 
                className='form-label'
              >
                   Username
                </label> 
              <input 
              id='username' 
              type='text'
              name='username'
              className='form-input'  
              placeholder='Enter username'
              value={values.username}
              onChange={handleChange}
              />

              {errors.username && <p>{errors.username}</p>}
            </div>
            <div className='form-inputs'>
                <label 
                htmlFor='email' 
                className='form-label'
                >
                   Email
                </label> 
              <input 
              id='email' 
              type='email'  
              name='email'
              className='form-input' 
              placeholder='Enter email' 
              value={values.email}
              onChange={handleChange}
              />
              {errors.email && <p>{errors.email}</p>}
            </div>
            <div className='form-inputs'>
                <label 
                htmlFor='email' 
                className='form-label'
                >
                   Password
                </label> 
              <input 
              id='password' 
              type='password' 
              name='password'
              className='form-input'  
              placeholder='Enter password' 
              value={values.password}
              onChange={handleChange}
              />
              {errors.password && <p>{errors.password}</p>}
            </div>
            <div className='form-inputs'>
                <label 
                htmlFor='password' 
                className='form-label'>
                   Conferm password
                 </label> 
              <input 
              id='password2' 
              type='password' 
              className='form-input' 
              name='password2'
              placeholder='Conferm password' 
              value={values.password2}
              onChange={handleChange}
              />
              {errors.password2 && <p>{errors.password2}</p>}
            </div>
            <button type='submit' className='sign-up-btn' >Sign Up</button>
            <span className='login-btn'> Allready have an account? Login <a href='#'> here</a></span>
        </form>
    </div>
  )
}

export default ForSignUp
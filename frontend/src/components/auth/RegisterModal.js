import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User, Calendar, AlertCircle, Loader2, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import GoogleAuthButton from './GoogleAuthButton';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    diabetesType: 'type1',
    dateOfBirth: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const { signUp } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Data de nascimento é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(formData.email, formData.password, {
        fullName: formData.fullName,
        diabetesType: formData.diabetesType,
        dateOfBirth: formData.dateOfBirth
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ general: 'Este email já está cadastrado' });
        } else {
          setErrors({ general: error.message });
        }
        return;
      }
      
      toast.success('Conta criada com sucesso! Verifique seu email para confirmar.', {
        icon: '🎉',
        duration: 6000,
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff',
        },
      });
      onClose();
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        diabetesType: 'type1',
        dateOfBirth: ''
      });
      setErrors({});
      
    } catch (error) {
      console.error('Erro no registro:', error);
      setErrors({ general: 'Erro interno. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo específico
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
        isVisible ? 'bg-black/60 backdrop-blur-md' : 'bg-black/0 backdrop-blur-none'
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div 
        className={`relative bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto transition-all duration-700 transform ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-8'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 50px rgba(16, 185, 129, 0.15)'
        }}
      >
        {/* Floating Elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full opacity-80 animate-pulse"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-60 animate-bounce"></div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <Heart className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl blur opacity-30 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-blue-800 bg-clip-text text-transparent">
                Criar Conta
              </h2>
              <p className="text-gray-600 text-sm mt-1 animate-fade-in">
                Junte-se à nossa comunidade
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 group"
          >
            <X className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Error Alert */}
        {errors.general && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl flex items-start animate-shake">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0 animate-pulse" />
            <span className="text-red-700 text-sm font-medium">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Field */}
          <div className="group">
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
              Nome Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className={`h-5 w-5 transition-colors duration-300 ${
                  formData.fullName ? 'text-green-500' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`block w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-gray-50/50 backdrop-blur-sm ${
                  errors.fullName 
                    ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-300'
                } focus:shadow-lg transform focus:scale-[1.02]`}
                placeholder="Seu nome completo"
                disabled={isLoading}
              />
              {formData.fullName && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Sparkles className="w-5 h-5 text-green-500 animate-pulse" />
                </div>
              )}
            </div>
            {errors.fullName && (
              <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.fullName}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 transition-colors duration-300 ${
                  formData.email ? 'text-green-500' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`block w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-gray-50/50 backdrop-blur-sm ${
                  errors.email 
                    ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-300'
                } focus:shadow-lg transform focus:scale-[1.02]`}
                placeholder="seu@email.com"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.email}</p>
            )}
          </div>

          {/* Date of Birth and Diabetes Type in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="group">
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                Data de Nascimento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className={`h-5 w-5 transition-colors duration-300 ${
                    formData.dateOfBirth ? 'text-green-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`block w-full pl-12 pr-4 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-gray-50/50 backdrop-blur-sm ${
                    errors.dateOfBirth 
                      ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-300'
                  } focus:shadow-lg transform focus:scale-[1.02]`}
                  disabled={isLoading}
                />
              </div>
              {errors.dateOfBirth && (
                <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Diabetes Type */}
            <div className="group">
              <label htmlFor="diabetesType" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                Tipo de Diabetes
              </label>
              <select
                id="diabetesType"
                name="diabetesType"
                value={formData.diabetesType}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-gray-50/50 backdrop-blur-sm hover:border-gray-300 focus:shadow-lg transform focus:scale-[1.02]"
                disabled={isLoading}
              >
                <option value="type1">Tipo 1</option>
                <option value="type2">Tipo 2</option>
                <option value="gestational">Gestacional</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          {/* Password Fields in Grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Password Field */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors duration-300 ${
                    formData.password ? 'text-green-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-12 pr-12 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-gray-50/50 backdrop-blur-sm ${
                    errors.password 
                      ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-300'
                  } focus:shadow-lg transform focus:scale-[1.02]`}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-green-600 transition-colors">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors duration-300 ${
                    formData.confirmPassword ? 'text-green-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-12 pr-12 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-gray-50/50 backdrop-blur-sm ${
                    errors.confirmPassword 
                      ? 'border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-300'
                  } focus:shadow-lg transform focus:scale-[1.02]`}
                  placeholder="Confirme sua senha"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-green-700 text-white py-3 px-6 rounded-2xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.02] hover:-translate-y-1 group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-700 via-blue-700 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  <span className="font-semibold">Criando conta...</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">Criar Conta</span>
                  <div className="ml-2 transform group-hover:translate-x-1 transition-transform">✨</div>
                </>
              )}
            </div>
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <span className="px-4 text-sm text-gray-500 bg-white rounded-full font-medium">ou continue com</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>

        {/* Google Login */}
        <GoogleAuthButton onClose={onClose} />

        {/* Switch to Login */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-blue-600 font-semibold hover:underline transition-all duration-300 transform hover:scale-105 inline-block"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;

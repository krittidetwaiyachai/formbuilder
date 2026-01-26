"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FormTheme } from "@/types";
import { Palette, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: FormTheme;
  onThemeSelect: (theme: FormTheme) => void;
}

const presetThemes: Record<string, FormTheme> = {
  default: {
    primaryColor: "#000000",
    backgroundColor: "#FFFFFF",
    backgroundType: "color",
    textColor: "#1E293B",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Inter",
  },
  dark: {
    primaryColor: "#00ADB5",
    backgroundColor: "#222831",
    backgroundType: "color",
    textColor: "#EEEEEE",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Inter",
  },
  midnight: {
    primaryColor: "#818CF8",
    backgroundColor: "#0F172A",
    backgroundType: "color",
    textColor: "#E2E8F0",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Inter",
  },
  modern: {
    primaryColor: "#6C63FF",
    backgroundColor: "#F3F4F6",
    backgroundType: "color",
    textColor: "#1F2937",
    buttonStyle: "filled",
    borderRadius: "large",
    fontFamily: "Poppins",
  },
  sunset: {
    primaryColor: "#F97316",
    backgroundColor: "#1C1917",
    backgroundType: "color",
    textColor: "#FEF3C7",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Inter",
  },
  warm: {
    primaryColor: "#D97706",
    backgroundColor: "#FFFBEB",
    backgroundType: "color",
    textColor: "#78350F",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Nunito",
  },
  forest: {
    primaryColor: "#059669",
    backgroundColor: "#ECFDF5",
    backgroundType: "color",
    textColor: "#064E3B",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Open Sans",
  },
  mint: {
    primaryColor: "#14B8A6",
    backgroundColor: "#134E4A",
    backgroundType: "color",
    backgroundImage: "",
    textColor: "#CCFBF1",
    buttonStyle: "filled",
    borderRadius: "large",
    fontFamily: "Inter",
  },
  luxury: {
    primaryColor: "#D4AF37",
    backgroundColor: "#18181B",
    backgroundType: "color",
    backgroundImage: "",
    textColor: "#FAFAFA",
    buttonStyle: "outlined",
    borderRadius: "none",
    fontFamily: "Playfair Display",
  },
  lavender: {
    primaryColor: "#A855F7",
    backgroundColor: "#FAF5FF",
    backgroundType: "color",
    backgroundImage: "",
    textColor: "#581C87",
    buttonStyle: "filled",
    borderRadius: "large",
    fontFamily: "Quicksand",
  },
  pastel: {
    primaryColor: "#F472B6",
    backgroundColor: "#FDF2F8",
    backgroundType: "color",
    backgroundImage: "",
    textColor: "#831843",
    buttonStyle: "filled",
    borderRadius: "large",
    fontFamily: "Quicksand",
  },
  ocean: {
    primaryColor: "#0EA5E9",
    backgroundColor: "#F0F9FF",
    backgroundType: "color",
    backgroundImage: "",
    textColor: "#0C4A6E",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Lato",
  },
  coffee: {
    primaryColor: "#A16207",
    backgroundColor: "#292524",
    backgroundType: "color",
    backgroundImage: "",
    textColor: "#FEF3C7",
    buttonStyle: "filled",
    borderRadius: "small",
    fontFamily: "Merriweather",
  },
  coral: {
    primaryColor: "#FB7185",
    backgroundColor: "#FFF1F2",
    backgroundType: "color",
    backgroundImage: "",
    textColor: "#881337",
    buttonStyle: "filled",
    borderRadius: "large",
    fontFamily: "Nunito",
  },
  slate: {
    primaryColor: "#475569",
    backgroundColor: "#F8FAFC",
    backgroundType: "color",
    backgroundImage: "",
    textColor: "#0F172A",
    buttonStyle: "filled",
    borderRadius: "small",
    fontFamily: "Inter",
  },
  neon: {
    primaryColor: "#22D3EE",
    backgroundColor: "#020617",
    backgroundType: "color",
    backgroundImage: "",
    textColor: "#E0F2FE",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Space Mono",
  },
  valentine: {
    primaryColor: "#EC4899",
    backgroundColor: "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FDF2F8 100%)",
    backgroundType: "gradient",
    backgroundImage: "",
    textColor: "#9F1239",
    buttonStyle: "filled",
    borderRadius: "large",
    fontFamily: "Quicksand",
  },
  halloween: {
    primaryColor: "#F97316",
    backgroundColor: "linear-gradient(135deg, #1C1917 0%, #292524 50%, #1C1917 100%)",
    backgroundType: "gradient",
    backgroundImage: "",
    textColor: "#FED7AA",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Creepster",
  },
  newyear: {
    primaryColor: "#FCD34D",
    backgroundColor: "linear-gradient(135deg, #18181B 0%, #27272A 50%, #18181B 100%)",
    backgroundType: "gradient",
    backgroundImage: "",
    textColor: "#FEF3C7",
    buttonStyle: "filled",
    borderRadius: "none",
    fontFamily: "Playfair Display",
  },
  songkran: {
    primaryColor: "#0EA5E9",
    backgroundColor: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #F0F9FF 100%)",
    backgroundType: "gradient",
    backgroundImage: "",
    textColor: "#0C4A6E",
    buttonStyle: "filled",
    borderRadius: "large",
    fontFamily: "Sarabun",
  },
  loykrathong: {
    primaryColor: "#F59E0B",
    backgroundColor: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #1E3A8A 100%)",
    backgroundType: "gradient",
    backgroundImage: "",
    textColor: "#FEF3C7",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Sarabun",
  },
  thailandpost: {
    primaryColor: "#ED1C24",
    backgroundColor: "#FFFFFF",
    backgroundType: "image",
    backgroundImage: "/themes/thailand-post-logo.png",
    textColor: "#1E1F57",
    buttonStyle: "filled",
    borderRadius: "medium",
    fontFamily: "Sarabun",
  }
};

const isThemeEqual = (t1: FormTheme | null | undefined, t2: FormTheme | null | undefined) => {
    if (!t1 || !t2) return false;
    return (
        t1.primaryColor === t2.primaryColor &&
        t1.backgroundColor === t2.backgroundColor &&
        t1.backgroundType === t2.backgroundType &&
        t1.textColor === t2.textColor &&
        t1.buttonStyle === t2.buttonStyle &&
        t1.borderRadius === t2.borderRadius &&
        t1.fontFamily === t2.fontFamily
    );
};

import { useTranslation } from "react-i18next";

export default function ThemeSelectionModal({ isOpen, onClose, currentTheme, onThemeSelect }: ThemeSelectionModalProps) {
  const { t } = useTranslation();
  const [workingTheme, setWorkingTheme] = useState<FormTheme>(currentTheme);

  
  React.useEffect(() => {
    if (isOpen && currentTheme) {
      setWorkingTheme(currentTheme);
    }
  }, [isOpen, currentTheme]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        { }
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t('dashboard.theme.appearance', 'Form Appearance')}</h3>
              <p className="text-sm text-gray-500">{t('dashboard.theme.customize_desc', 'Customize how your form looks')}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        { }
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-visible bg-gray-50 p-6 space-y-6">
                 { }
                 <div>
                   <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text, #1F2937)' }}>{t('dashboard.theme.popular', 'Popular Themes')}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(presetThemes).filter(([name]) => 
                        !['valentine', 'halloween', 'newyear', 'songkran', 'loykrathong', 'thailandpost'].includes(name)
                      ).map(([name, theme]) => {
                         const isGradient = theme.backgroundType === 'gradient';
                         const bgStyle = isGradient 
                            ? { background: `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.primaryColor}22)` }
                            : { backgroundColor: theme.backgroundColor };
                         
                         return (
                            <button
                                key={name}
                                onClick={() => {
                                    setWorkingTheme(theme);
                                }}
                                className="group relative flex flex-col text-left bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-black hover:shadow-xl transition-all duration-200 ring-offset-2 focus:ring-2 focus:ring-black"
                            >
                                { }
                                <div className="h-24 w-full relative p-3 flex flex-col gap-2" style={bgStyle}>
                                    {theme.backgroundImage && (
                                        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${theme.backgroundImage})` }} />
                                    )}
                                    { }
                                    <div className="h-2 w-1/2 bg-gray-200/50 rounded animate-pulse" style={{ backgroundColor: theme.textColor, opacity: 0.1 }} />
                                    <div className="h-2 w-3/4 bg-gray-200/50 rounded animate-pulse" style={{ backgroundColor: theme.textColor, opacity: 0.1 }} />
                                    <div 
                                        className="mt-auto self-start px-3 py-1 text-[10px] font-medium rounded shadow-sm"
                                        style={{ 
                                            backgroundColor: theme.buttonStyle === 'filled' ? theme.primaryColor : 'transparent',
                                            color: theme.buttonStyle === 'filled' ? '#fff' : theme.primaryColor,
                                            border: theme.buttonStyle === 'outlined' ? `1px solid ${theme.primaryColor}` : 'none',
                                            borderRadius: theme.borderRadius === 'small' ? '4px' : theme.borderRadius === 'medium' ? '8px' : theme.borderRadius === 'large' ? '12px' : '0px'
                                        }}
                                    >
                                        {t('dashboard.theme.submit_preview', 'Submit')}
                                    </div>
                                </div>
                                
                                { }
                                <div className="p-3 bg-white">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-900 capitalize">{name}</span>
                                        { }
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider" style={{ fontFamily: theme.fontFamily }}>Aa</span>
                                    </div>
                                    <div className="flex gap-1 mt-2">
                                        <div className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: theme.primaryColor }} title="Primary" />
                                        <div className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: theme.backgroundColor }} title="Background" />
                                        <div className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: theme.textColor }} title="Text" />
                                    </div>
                                </div>
                                
                                { }
                                {isThemeEqual(workingTheme, theme) && (
                                    <div className="absolute top-2 right-2 w-7 h-7 bg-black rounded-full flex items-center justify-center text-white shadow-lg">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                         );
                      })}
                   </div>
                 </div>

                 { }
                 <div>
                   <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text, #1F2937)' }}>                              
                     <span>{t('dashboard.theme.exclusive', 'Exclusive Themes')}</span>
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(presetThemes).filter(([name]) => 
                        ['thailandpost'].includes(name)
                      ).map(([name, theme]) => {
                         const bgStyle = { backgroundColor: theme.backgroundColor };
                         
                         return (
                            <button
                                key={name}
                                onClick={() => {
                                    setWorkingTheme(theme);
                                }}
                                className="group relative flex flex-col text-left rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 transform-gpu"
                                style={{ 
                                    background: 'linear-gradient(90deg, #ED1C24, #FFFFFF, #1E1F57)',
                                    padding: '2px'
                                }}
                            >
                                { }
                                <div className="relative flex flex-col w-full h-full bg-white rounded-[10px] overflow-hidden">
                                
                                    { }
                                    <div className="h-28 w-full relative p-4 flex flex-col gap-3 overflow-hidden">
                                        { }
                                        <div 
                                            className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                                            style={{ 
                                                backgroundImage: `url(${theme.backgroundImage})`,
                                                backgroundSize: 'contain',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat'
                                            }} 
                                        />
                                        
                                        { }
                                        <div className="absolute top-0 right-0 z-20 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm">
                                            {t('dashboard.theme.exclusive_badge', 'EXCLUSIVE')}
                                        </div>

                                        { }
                                        <div 
                                            className="absolute top-3 right-3 w-10 h-10 z-10 filter drop-shadow-sm"
                                            style={{ 
                                                backgroundImage: `url(${theme.backgroundImage})`,
                                                backgroundSize: 'contain',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat'
                                            }} 
                                        />

                                        { }
                                        <div className="h-2.5 w-1/2 bg-gray-100 rounded-full relative overflow-hidden">
                                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shimmer" style={{ transform: 'skewX(-20deg)' }} />
                                        </div>
                                        <div className="h-2.5 w-3/4 bg-gray-100 rounded-full relative overflow-hidden">
                                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shimmer" style={{ transform: 'skewX(-20deg)', animationDelay: '0.2s' }} />
                                        </div>
                                        
                                        <div 
                                            className="mt-auto self-start px-4 py-1.5 text-[11px] font-bold rounded-md shadow-md transform transition-transform group-hover:scale-105"
                                            style={{ 
                                                backgroundColor: '#ED1C24',
                                                color: '#fff',
                                            }}
                                        >
                                            {t('dashboard.theme.submit_preview', 'Submit')}
                                        </div>
                                    </div>
                                    
                                    { }
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm leading-tight">Thailand Post</span>
                                                <span className="text-[10px] text-gray-500 font-medium">{t('dashboard.theme.official', 'Official Theme')}</span>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 border border-gray-200 px-1 rounded">Aa</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: "#ED1C24" }} />
                                            <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm bg-white" />
                                            <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: "#1E1F57" }} />
                                        </div>
                                    </div>
                                </div>
                                
                                { }
                                {isThemeEqual(workingTheme, theme) && (
                                    <div className="absolute inset-0 z-30 pointer-events-none rounded-xl border-4 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center shadow-sm">
                                            <Check className="w-4 h-4 text-yellow-900" strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                            </button>
                         );
                      })}
                   </div>
                 </div>

                 { }
                 <div>
                   <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text, #1F2937)' }}>
                     <span>{t('dashboard.theme.festival', 'Festival Themes')}</span>
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(presetThemes).filter(([name]) => 
                        ['valentine', 'halloween', 'newyear', 'songkran', 'loykrathong'].includes(name)
                      ).map(([name, theme]) => {
                         const isGradient = theme.backgroundType === 'gradient';
                         const bgStyle = isGradient 
                            ? { background: `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.primaryColor}22)` }
                            : { backgroundColor: theme.backgroundColor };
                         
                         const festivalEmojis: Record<string, string> = {
                           valentine: '💕',
                           halloween: '🎃',
                           newyear: '🎊',
                           songkran: '💦',
                           loykrathong: '🏮'
                         };

                         const festivalDecorations: Record<string, string[]> = {
                           valentine: ['💕', '💖', '💝', '🌹'],
                           halloween: ['🎃', '👻', '🦇', '🕷️'],
                           newyear: ['🎊', '🎉', '✨', '🎆'],
                           songkran: ['💦', '🌊', '💧', '🐘'],
                           loykrathong: ['🏮', '🌕', '🪔', '🌸']
                         };
                         
                         const isDarkTheme = ['halloween', 'newyear', 'loykrathong'].includes(name);
                         const cardBg = isDarkTheme ? '#1A1A1A' : '#FFFFFF';
                         const cardTextColor = isDarkTheme ? '#E5E7EB' : '#1F2937';
                         
                         return (
                            <button
                                key={name}
                                onClick={() => {
                                    setWorkingTheme(theme);
                                }}
                                className="group relative flex flex-col text-left border-2 border-gray-200 rounded-xl overflow-hidden hover:border-black hover:shadow-xl transition-all duration-200 ring-offset-2 focus:ring-2 focus:ring-black"
                                style={{ backgroundColor: cardBg }}
                            >
                                { }
                                <div className="h-24 w-full relative p-3 flex flex-col gap-2" style={bgStyle}>
                                    {theme.backgroundImage && (
                                        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${theme.backgroundImage})` }} />
                                    )}
                                    { }
                                    <div className="absolute top-1 left-1 text-lg opacity-60">{festivalDecorations[name][0]}</div>
                                    <div className="absolute top-1 right-1 text-lg opacity-60">{festivalDecorations[name][1]}</div>
                                    <div className="absolute bottom-1 left-1 text-lg opacity-60">{festivalDecorations[name][2]}</div>
                                    <div className="absolute bottom-1 right-1 text-lg opacity-60">{festivalDecorations[name][3]}</div>
                                    
                                    { }
                                    <div className="h-2 w-1/2 bg-gray-200/50 rounded animate-pulse" style={{ backgroundColor: theme.textColor, opacity: 0.1 }} />
                                    <div className="h-2 w-3/4 bg-gray-200/50 rounded animate-pulse" style={{ backgroundColor: theme.textColor, opacity: 0.1 }} />
                                    <div 
                                        className="mt-auto self-start px-3 py-1 text-[10px] font-medium rounded shadow-sm"
                                        style={{ 
                                            backgroundColor: theme.buttonStyle === 'filled' ? theme.primaryColor : 'transparent',
                                            color: theme.buttonStyle === 'filled' ? '#fff' : theme.primaryColor,
                                            border: theme.buttonStyle === 'outlined' ? `1px solid ${theme.primaryColor}` : 'none',
                                            borderRadius: theme.borderRadius === 'small' ? '4px' : theme.borderRadius === 'medium' ? '8px' : theme.borderRadius === 'large' ? '12px' : '0px'
                                        }}
                                    >
                                        {t('dashboard.theme.submit_preview', 'Submit')}
                                    </div>
                                </div>
                                
                                { }
                                <div className="p-3" style={{ backgroundColor: cardBg }}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold capitalize" style={{ color: cardTextColor }}>{name}</span>
                                        { }
                                        <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: theme.fontFamily, color: cardTextColor, opacity: 0.7 }}>Aa</span>
                                    </div>
                                    <div className="flex gap-1 mt-2">
                                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.primaryColor, borderColor: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} title="Primary" />
                                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.backgroundColor, borderColor: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} title="Background" />
                                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.textColor, borderColor: isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} title="Text" />
                                    </div>
                                </div>
                                
                                { }
                                {isThemeEqual(workingTheme, theme) && (
                                    <div className="absolute top-2 right-2 w-7 h-7 bg-black rounded-full flex items-center justify-center text-white shadow-lg">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                         );
                      })}
                   </div>
                 </div>
              </div>
        </div>

         { }
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 shrink-0">
             <Button variant="outline" onClick={onClose}>{t('dashboard.theme.close', 'Close')}</Button>
             <Button onClick={() => { onThemeSelect(workingTheme); onClose(); }} className="bg-black hover:bg-gray-800 text-white">{t('dashboard.theme.done', 'Done')}</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, FastForward, ArrowLeft, Bomb, Volume2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import Slider from '../ui/Slider';

export default function Settings({
  setGameState, fastMode, setFastMode, saveGame, handleExport, setImportModalOpen,
  couponInput, setCouponInput, handleCoupon, adminClearSave
}) {
  const [deleteStep, setDeleteStep] = useState(0);

  // 오디오 컨트롤 관련 상태
  const { changeBGMVolume, changeSFXVolume, currentBGMVolume, currentSFXVolume, playSFX } = useAudio();
  const [bgm, setBgm] = useState(currentBGMVolume ?? 0.5);
  const [sfx, setSfx] = useState(currentSFXVolume ?? 0.7);

  useEffect(() => {
    if (deleteStep > 0) {
      const timer = setTimeout(() => setDeleteStep(0), 5000);
      return () => clearTimeout(timer);
    }
  }, [deleteStep]);

  const handleBGMChange = (val) => {
    setBgm(val);
    if (changeBGMVolume) changeBGMVolume(val);
  };

  const handleSFXChange = (val) => {
    setSfx(val);
    if (changeSFXVolume) changeSFXVolume(val);
    // 효과음 조절 시 즉시 피드백을 주기 위해 재생 (hover 사운드 등)
    if (playSFX) playSFX('hover');
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[100dvh] bg-slate-900 text-white p-4 md:p-10 pt-10 overflow-y-auto hide-scrollbar">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 shrink-0 relative z-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-300 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-400" /> 게임 설정
        </h1>
        <button onClick={() => setGameState('MENU')} className="py-2 px-6 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 hover:-translate-y-1">
          <ArrowLeft className="w-5 h-5"/> 메인으로
        </button>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        
        {/* 오디오 설정 영역 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400"/> 사운드 설정
          </h2>
          <div className="flex flex-col gap-2 bg-slate-900 p-6 rounded-xl border border-slate-700">
            <Slider 
              label="배경음악 (BGM)" 
              value={bgm} 
              onChange={handleBGMChange} 
            />
            <div className="my-2 border-t border-slate-800"></div>
            <Slider 
              label="효과음 (SFX)" 
              value={sfx} 
              onChange={handleSFXChange} 
            />
          </div>
        </div>

        {/* 일반 설정 영역 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">일반 설정</h2>
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div>
              <div className="font-bold text-indigo-400 flex items-center gap-2"><FastForward className="w-4 h-4"/> 빠른 전투 모드</div>
              <div className="text-xs text-slate-400 mt-1">적의 턴 애니메이션 속도를 대폭 높입니다.</div>
            </div>
            <button onClick={() => { setFastMode(!fastMode); saveGame({ fastMode: !fastMode }); }} className={`px-4 py-2 rounded-lg font-bold transition-colors ${fastMode ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
              {fastMode ? '켜짐' : '꺼짐'}
            </button>
          </div>
        </div>

        {/* 쿠폰 입력 영역 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">쿠폰 입력</h2>
          <div className="flex gap-2">
            <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="쿠폰 코드를 입력하세요" className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-amber-500 uppercase"/>
            <button onClick={handleCoupon} className="px-6 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md transition-colors">확인</button>
          </div>
        </div>

        {/* 데이터 관리 영역 */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">데이터 관리</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button onClick={handleExport} className="py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold flex items-center justify-center gap-2 border border-slate-600 transition-colors"><Download className="w-4 h-4"/> 세이브 백업 (복사)</button>
            <button onClick={() => setImportModalOpen(true)} className="py-3 bg-emerald-800 hover:bg-emerald-700 rounded-lg font-bold flex items-center justify-center gap-2 border border-emerald-600 transition-colors"><Upload className="w-4 h-4"/> 세이브 불러오기</button>
          </div>

          {deleteStep === 0 && (
            <button onClick={() => setDeleteStep(1)} className="w-full py-3 bg-red-900/40 hover:bg-red-800 rounded-lg font-bold text-red-400 hover:text-white flex items-center justify-center gap-2 border border-red-900/50 transition-colors">
              <Trash2 className="w-4 h-4"/> 모든 세이브 데이터 삭제 (초기화)
            </button>
          )}
          {deleteStep === 1 && (
            <button onClick={() => setDeleteStep(2)} className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold text-white flex items-center justify-center gap-2 border border-red-500 transition-all animate-pulse">
              <Trash2 className="w-5 h-5"/> 정말 삭제하시겠습니까? (복구 불가)
            </button>
          )}
          {deleteStep === 2 && (
            <button onClick={adminClearSave} className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg font-black text-white flex items-center justify-center gap-2 border-2 border-red-400 transition-all shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-[bounce_0.5s_ease-in-out_infinite]">
              <Bomb className="w-6 h-6"/> 최종 확인: 누르는 즉시 모든 데이터가 증발합니다!
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
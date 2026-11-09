import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly
for f in sys.argv[1:]:
    x,sr=sf.read(f); 
    if x.ndim>1: x=x.mean(1)
    x=resample_poly(x,2,1) if sr==24000 else x
    x=sosfilt(butter(2,90/24000,'high',output='sos'),x)
    x=x/np.max(np.abs(x)); x=np.tanh(x*1.8)/np.tanh(1.8)   # gentle saturation/compression
    n=int(0.02*48000); x[:n]*=np.linspace(0,1,n); x[-n:]*=np.linspace(1,0,n)
    sf.write(f.replace('.wav','_m.wav'),np.stack([x,x],1)*0.9,48000,subtype='PCM_16')
    print(f,len(x)/48000)

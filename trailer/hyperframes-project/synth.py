import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR=48000; DUR=32.0; N=int(SR*DUR)
rng=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
def filt(x,kind,fc,order=2):
    sos=butter(order,np.array(fc)/(SR/2),btype=kind,output='sos'); return sosfilt(sos,x)
def add(sig,t,gain=1.0,pan=0.0):
    i=int(t*SR)
    if i>=N or i<0: return
    n=min(len(sig),N-i)
    l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    L[i:i+n]+=sig[:n]*gain*l*1.414; R[i:i+n]+=sig[:n]*gain*r*1.414
def tt(d): return np.arange(int(d*SR))/SR
def kick(amp=1.0,d=0.45):
    t=tt(d); f=45+110*np.exp(-t*28); ph=2*np.pi*np.cumsum(f)/SR
    return amp*(np.sin(ph)*np.exp(-t*7)+0.25*filt(rng.standard_normal(len(t)),'high',3000)*np.exp(-t*200))
def boom(d=3.0):
    t=tt(d); f=32+60*np.exp(-t*6); ph=2*np.pi*np.cumsum(f)/SR
    sub=np.sin(ph)*np.exp(-t*1.6)
    crash=filt(rng.standard_normal(len(t)),'band',[300,7000])*np.exp(-t*2.2)*0.5
    thud=filt(rng.standard_normal(len(t)),'low',180)*np.exp(-t*9)*1.5
    return np.tanh(1.6*(sub+thud))+crash
def hat(d=0.05,amp=1.0):
    t=tt(d); return amp*filt(rng.standard_normal(len(t)),'high',7500)*np.exp(-t/d*5)
def clap():
    t=tt(0.22); n=filt(rng.standard_normal(len(t)),'band',[900,4500])
    e=np.exp(-t*22)+0.6*np.exp(-np.abs(t-0.012)*400)+0.5*np.exp(-np.abs(t-0.024)*400)
    return n*e
def riser(d,f0=300,f1=9000):
    t=tt(d); n=rng.standard_normal(len(t)); out=np.zeros(len(t)); K=24
    for k in range(K):
        a=int(k*len(t)/K); b=int((k+1)*len(t)/K) ; fc=f0*(f1/f0)**((k+.5)/K)
        seg=filt(n,'band',[fc*0.7,min(fc*1.4,20000)])
        w=np.zeros(len(t)); w[a:b]=1; w=filt(w,'low',30,1)
        out+=seg*w
    tone=np.sin(2*np.pi*np.cumsum(110*(4)**(t/d))/SR)*0.25
    return (out+tone)*(t/d)**2.2
def whoosh(d=0.35):
    t=tt(d); n=filt(rng.standard_normal(len(t)),'band',[800,6000]); return n*np.sin(np.pi*t/d)**2
def blip(f,d=0.045):
    t=tt(d); return np.sin(2*np.pi*f*t)*np.exp(-t*70)
def pluck(f,d=0.22,bright=2500):
    t=tt(d); x=sum(np.sin(2*np.pi*f*h*t)/h for h in range(1,9)); x=filt(x,'low',min(bright,20000)); return x*np.exp(-t*16)*0.5
def bassnote(f,d=0.22):
    t=tt(d); x=sum(np.sin(2*np.pi*f*h*t)/h for h in range(1,7)); x=filt(x,'low',420); return np.tanh(x)*np.minimum(t*200,1)*np.exp(-t*7)
def pad(freqs,d,cut=900):
    t=tt(d); x=np.zeros(len(t))
    for f in freqs:
        for det in (-0.004,0,0.004):
            ph=2*np.pi*f*(1+det)*t; x+=sum(np.sin(ph*h)/h for h in range(1,6))
    x=filt(x,'low',cut); return x/len(freqs)/3
B=0.5
# chord map by time: (root bass hz, arp notes)
D=[146.83,174.61,220.0,293.66,220.0,174.61,261.63,220.0]
Bb=[116.54,146.83,174.61,233.08,174.61,146.83,220.0,174.61]
C=[130.81,164.81,196.0,261.63,196.0,164.81,246.94,196.0]
def chord(t):
    if 23<=t<24.5: return 58.27,Bb
    if 24.5<=t<26: return 65.41,C
    return 73.42,D
# drone
t=tt(DUR)
dr=sum(np.sin(2*np.pi*36.71*h*t+0.3*h)/h for h in range(1,10)); dr=filt(dr,'low',260)
env=np.interp(t,[0,1,4,8,20,23,26,29,32],[0,.5,.7,.5,.6,.35,.6,.4,0])
lfo=1+0.15*np.sin(2*np.pi*0.25*t)
L+=dr*env*lfo*0.32; R+=np.roll(dr,300)*env*lfo*0.32
# S1 heartbeat + text slams
for b in (1.0,3.0): add(kick(0.7),b,0.9); add(kick(0.45),b+0.25,0.9)
for s in (0.5,2.0): add(boom(2.0),s,0.75)
add(riser(1.6),2.4,0.5)
# impacts on cuts
for c,g in ((4,1.0),(8,1.0),(14,1.0),(20,0.8),(23,1.15),(26,1.25)): add(boom(3.2),c,g)
for a,d,g in ((6.5,1.5,.5),(12.5,1.5,.55),(18.5,1.5,.55),(20.2,2.8,.75),(24.5,1.5,.6)): add(riser(d),a,g,0)
# drums
def beats(a,b,step=B):
    x=a
    while x<b-1e-6: yield x; x+=step
for b in beats(4,8): add(kick(0.9),b)
for b in beats(8,20): add(kick(1.0),b)
for b in beats(23,26): add(kick(1.0),b)
for b in beats(26.5,30): add(kick(0.85),b)
for b in beats(8.25,20,0.5): add(hat(0.05),b,0.22,0.3)
for b in beats(14,20,0.125): add(hat(0.03),b,0.10 if round(b*8)%2 else 0.16,-0.3)
for b in beats(23,26,0.125): add(hat(0.03),b,0.14,-0.3)
for b in beats(26.5,30,0.25): add(hat(0.04),b,0.15,0.3)
for b in beats(14.5,20,1.0): add(clap(),b,0.55)
for b in beats(23.5,26,1.0): add(clap(),b,0.6)
for b in beats(26.5,30,1.0): add(clap(),b+0.5,0.45)
for k in range(8): add(clap(),25.5+k*0.0625,0.25+0.05*k)  # roll into 26
for k in range(8): add(kick(0.6),22.5+k*0.0625,0.5+0.06*k)  # roll into 23
# bass + arp
for b in beats(8,20,0.25):
    r,_=chord(b); 
    if round(b*4)%2==1 or b>=14: add(bassnote(r),b,0.42)
for b in beats(23,30,0.25):
    r,_=chord(b); add(bassnote(r),b,0.46)
i=0
for b in beats(4,8,0.25):
    add(pluck(D[i%8]/2,0.2,700+150*i%900),b,0.20,(-1)**i*0.5); i+=1
i=0
for b in beats(8,20,0.125):
    _,ar=chord(b); br=900+ (b-8)/12*5000
    add(pluck(ar[i%8]*(2 if b>=14 and i%4==3 else 1),0.2,br),b,0.19,(-1)**i*0.6); 
    add(pluck(ar[i%8],0.2,br*0.6),b+0.1875,0.07,-(-1)**i*0.8); i+=1
i=0
for b in beats(23,30,0.125):
    _,ar=chord(b); g=0.22 if b<28 else 0.22*(30-b)/2
    add(pluck(ar[i%8]*(2 if i%4==3 else 1),0.2,6500),b,g,(-1)**i*0.6); add(pluck(ar[i%8]*2,0.2,3000),b+0.1875,0.08*g/0.22,-(-1)**i*0.8); i+=1
# pads
add(pad([146.83,220.0,349.23],6.2,700)*np.interp(tt(6.2),[0,2,5,6.2],[0,1,1,0]),14,0.16)
p=pad([116.54,174.61,293.66],1.6,1500); add(p*np.interp(tt(1.6),[0,.05,1.4,1.6],[0,1,1,0]),23,0.22)
p=pad([130.81,196.0,329.63],1.6,1800); add(p*np.interp(tt(1.6),[0,.05,1.4,1.6],[0,1,1,0]),24.5,0.22)
p=pad([73.42,146.83,220.0,293.66,440.0],6,2200); add(p*np.interp(tt(6),[0,.05,3,6],[0,1,.7,0]),26,0.26)
# breakdown tension tone 20-23 (gauge fill): rising ticks
k=0
for b in np.linspace(20.3,22.9,40): add(blip(600+k*45,0.04),b,0.10+0.004*k,(-1)**k*0.4); k+=1
# SFX: number storm flashes (S2), card pops (S3), hero cards (S4), chips (S6)
for k,b in enumerate(np.arange(4.0,7.9,0.25)): add(blip(1800 if k%2 else 2400),b,0.10,(-1)**k*0.7); 
for k,b in enumerate(np.arange(4.0,7.9,0.5)): add(whoosh(0.25),b,0.12,(-1)**k*0.6)
for k in range(18): add(blip(700*2**(k/12),0.05),8.6+k*0.125,0.13,-0.7+1.4*k/17)
for b in (14.0,16.0,18.0): add(whoosh(0.4),b-0.15,0.35)
for b in (14.75,16.75,18.75): add(blip(1318.5,0.25),b,0.16); add(blip(1975.5,0.25),b+0.08,0.12)
for k,b in enumerate((27.5,28.0,28.5)): add(whoosh(0.3),b-0.1,0.3,(-0.6,0,0.6)[k]); add(blip(880*(1.25**k),0.2),b,0.14)
add(blip(1760,0.6),29.5,0.2); add(blip(2637,0.6),29.58,0.15)
# ducking under VO
vo=[tuple(map(float,a.split(':'))) for a in sys.argv[2:]]
duck=np.ones(N)
for s,d in vo:
    a=int((s-0.08)*SR); b=int((s+d+0.12)*SR); duck[max(a,0):min(b,N)]=0.58
duck=filt(duck,'low',8,1)
mix=np.stack([L,R],1)*duck[:,None]
mix=filt(mix.T,'high',28).T
mix=np.tanh(mix*1.15)
fade=np.ones(N); fo=int(1.6*SR); fade[-fo:]=np.linspace(1,0,fo)**1.5; mix*=fade[:,None]
mix=mix/np.max(np.abs(mix))*0.84
sf.write(sys.argv[1],mix,SR,subtype='PCM_16')
print('peak',np.max(np.abs(mix)),'rms dB',20*np.log10(np.sqrt(np.mean(mix**2))))

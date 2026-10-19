/* Penjana kod QR tanpa internet/pustaka luar (Byte mode, ECC-L, V1-V9). */
const QR=(()=>{
  // [totalCodewords, ecCodewordsPerBlock, numBlocks, alignCenters]
  const VINFO=[
    null,
    [26,7,1,[]],[44,10,1,[6,18]],[70,15,1,[6,22]],[100,20,1,[6,26]],
    [134,26,1,[6,30]],[172,18,2,[6,34]],[196,20,2,[6,22,38]],
    [242,24,2,[6,24,42]],[292,30,2,[6,26,46]]
  ];
  const EXP=new Uint8Array(512),LOG=new Uint8Array(256);
  for(let i=0,x=1;i<255;i++){EXP[i]=x;EXP[i+255]=x;LOG[x]=i;x=(x<<1)^(x&128?285:0);}
  function rsEncode(data,ecLen){
    let gen=[1];
    for(let i=0;i<ecLen;i++){
      const nxt=new Array(gen.length+1).fill(0);
      for(let j=0;j<gen.length;j++){
        nxt[j]^=gen[j];
        nxt[j+1]^=gen[j]?EXP[LOG[gen[j]]+i]:0;
      }
      gen=nxt;
    }
    const res=new Uint8Array(ecLen);
    for(let i=0;i<data.length;i++){
      const fb=data[i]^res[0];
      for(let j=0;j<ecLen-1;j++)res[j]=res[j+1]^(fb?EXP[LOG[fb]+LOG[gen[j+1]]]:0);
      res[ecLen-1]=fb?EXP[LOG[fb]+LOG[gen[ecLen]]]:0;
    }
    return res;
  }
  function makeSVG(text,size=190){
    const bytes=new TextEncoder().encode(text);
    let ver=1;
    while(ver<=9){
      const [tot,ec,blk]=VINFO[ver];
      const cap=tot-ec*blk-2;
      if(bytes.length<=cap)break;
      ver++;
    }
    if(ver>9)return`<div style="color:#000;padding:10px;font-size:.75rem">Teks terlalu panjang untuk QR.</div>`;
    const [tot,ecLen,blocks,align]=VINFO[ver];
    const dataLen=tot-ecLen*blocks;
    const bits=[];
    const pushB=(v,n)=>{for(let i=n-1;i>=0;i--)bits.push((v>>i)&1);};
    pushB(4,4); // Byte mode
    pushB(bytes.length,8);
    bytes.forEach(b=>pushB(b,8));
    for(let i=0;i<4&&bits.length<dataLen*8;i++)bits.push(0);
    while(bits.length%8!==0)bits.push(0);
    const dataBytes=new Uint8Array(dataLen);
    for(let i=0;i<bits.length/8;i++){
      let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i*8+j];
      dataBytes[i]=b;
    }
    for(let i=bits.length/8,p=0;i<dataLen;i++,p^=1)dataBytes[i]=p?17:236;

    const dBlocks=[],eBlocks=[];
    const bSize=dataLen/blocks;
    for(let b=0;b<blocks;b++){
      const sub=dataBytes.slice(b*bSize,(b+1)*bSize);
      dBlocks.push(sub);
      eBlocks.push(rsEncode(sub,ecLen));
    }
    const finalBytes=[];
    for(let i=0;i<bSize;i++)for(let b=0;b<blocks;b++)finalBytes.push(dBlocks[b][i]);
    for(let i=0;i<ecLen;i++)for(let b=0;b<blocks;b++)finalBytes.push(eBlocks[b][i]);

    const dim=17+ver*4;
    const mat=Array.from({length:dim},()=>new Int8Array(dim));
    const rsv=Array.from({length:dim},()=>new Uint8Array(dim));
    const setM=(r,c,v)=>{mat[r][c]=v?1:0;rsv[r][c]=1;};
    const finder=(R,C)=>{
      for(let r=-1;r<=7;r++)for(let c=-1;c<=7;c++){
        const rr=R+r,cc=C+c;
        if(rr<0||rr>=dim||cc<0||cc>=dim)continue;
        const v=(r>=0&&r<=6&&(c===0||c===6))||(c>=0&&c<=6&&(r===0||r===6))||(r>=2&&r<=4&&c>=2&&c<=4);
        setM(rr,cc,v);
      }
    };
    finder(0,0);finder(0,dim-7);finder(dim-7,0);
    for(let i=8;i<dim-8;i++){setM(6,i,i%2===0);setM(i,6,i%2===0);}
    const aLast=align[align.length-1];
    for(let r of align)for(let c of align){
      // Langkau 3 sudut finder sahaja; corak yang bertindih garis timing (V7+) mesti dilukis
      if((r===6&&c===6)||(r===6&&c===aLast)||(r===aLast&&c===6))continue;
      for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++){
        setM(r+dr,c+dc,Math.abs(dr)===2||Math.abs(dc)===2||(dr===0&&dc===0));
      }
    }
    setM(dim-8,8,1);
    for(let i=0;i<9;i++){if(!rsv[8][i])rsv[8][i]=1;if(!rsv[i][8])rsv[i][8]=1;}
    for(let i=0;i<8;i++){if(!rsv[8][dim-1-i])rsv[8][dim-1-i]=1;if(!rsv[dim-1-i][8])rsv[dim-1-i][8]=1;}
    if(ver>=7){
      let rem=ver;for(let i=0;i<12;i++)rem=(rem<<1)^((rem>>11)*0x1F25);
      const vBits=(ver<<12)|rem;
      for(let i=0;i<18;i++){
        const bit=(vBits>>i)&1,a=dim-11+(i%3),b=Math.floor(i/3);
        setM(a,b,bit);setM(b,a,bit);
      }
    }

    let bitIdx=0,up=true;
    for(let c=dim-1;c>0;c-=2){
      if(c===6)c--;
      for(let i=0;i<dim;i++){
        const r=up?dim-1-i:i;
        for(let dc=0;dc<2;dc++){
          const cc=c-dc;
          if(!rsv[r][cc]){
            const bit=bitIdx<finalBytes.length*8?((finalBytes[bitIdx>>3]>>(7-(bitIdx&7)))&1):0;
            bitIdx++;
            mat[r][cc]=bit^((r+cc)%2===0?1:0); // Mask 0
          }
        }
      }
      up=!up;
    }
    // Format info for Level L (01) + Mask 0 (000) -> 01000 -> BCH & XOR 0x5412 = 0x77C4
    const fmt=0x77C4;
    const fPos1=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
    for(let i=0;i<15;i++){
      const bit=(fmt>>(14-i))&1;
      const [r1,c1]=fPos1[i];
      mat[r1][c1]=bit;
      if(i<7)mat[dim-1-i][8]=bit;
      else mat[8][dim-15+i]=bit;
    }

    let paths="";
    for(let r=0;r<dim;r++)for(let c=0;c<dim;c++)if(mat[r][c])paths+=`M${c},${r}h1v1h-1z`;
    return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${dim+4} ${dim+4}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${dim+4}" height="${dim+4}" fill="#fff"/><path d="${paths}" fill="#000"/></svg>`;
  }
  return{makeSVG};
})();

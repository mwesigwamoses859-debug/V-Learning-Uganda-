export async function api<T = any>(path: string, body?: unknown, method?: string): Promise<T> {
  const response = await fetch(path, { credentials: 'same-origin', method: method || (body === undefined ? 'GET' : 'POST'), headers: body === undefined ? {} : {'Content-Type':'application/json'}, body: body === undefined ? undefined : JSON.stringify(body) });
  const result = await response.json().catch(() => ({error:'The server returned an unexpected response. Please try again.'}));
  if (!response.ok) throw new Error(result.error || 'This action could not be completed.');
  return result;
}
function put(url: string, blob: Blob, progress: (value: number) => void): Promise<any> {
  return new Promise((resolve,reject) => {
    const xhr = new XMLHttpRequest(); xhr.open('PUT',url); xhr.withCredentials = true; xhr.setRequestHeader('Content-Type','application/octet-stream');
    xhr.upload.onprogress = e => { if(e.lengthComputable) progress(e.loaded/e.total); };
    xhr.onerror = () => reject(new Error('The connection was interrupted. Please select the file again to retry.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));
    xhr.onload = () => { let result; try { result=JSON.parse(xhr.responseText); } catch { result={error:'Upload failed. Please try again.'}; } if(xhr.status>=200&&xhr.status<300) resolve(result); else reject(new Error(result.error || 'Upload failed.')); };
    xhr.send(blob);
  });
}
export async function uploadFile(file: File, progress: (value: number) => void): Promise<string> {
  let mime=file.type; if(!mime && file.name.toLowerCase().endsWith('.pdf')) mime='application/pdf';
  const upload=await api('/api/uploads',{name:file.name,mime,size:file.size});
  if(!upload.multipart) await put(`/api/uploads/${upload.id}`,file,progress);
  else {
    const parts=[];
    for(let offset=0, number=1;offset<file.size;offset+=upload.chunkSize,number++) {
      const part=file.slice(offset,Math.min(offset+upload.chunkSize,file.size));
      parts.push(await put(`/api/uploads/${upload.id}/part/${number}`,part,fraction=>progress((offset+fraction*part.size)/file.size)));
    }
    await api(`/api/uploads/${upload.id}/complete`,{parts});
  }
  progress(1); return upload.id;
}

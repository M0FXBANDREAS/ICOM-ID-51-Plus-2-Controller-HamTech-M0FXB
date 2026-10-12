'use strict';
const {app,BrowserWindow,ipcMain,Menu,shell}=require('electron');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
let win,selection=null;
const entry=pathToFileURL(path.join(__dirname,'ui','index.html')).href;
function safeSender(e){return win&&!win.isDestroyed()&&e.sender===win.webContents&&e.senderFrame?.url===entry}
function sendPorts(){if(win&&!win.isDestroyed()&&selection)win.webContents.send('serial-ports',selection.ports.map(p=>({portId:p.portId,portName:p.portName||p.portId,displayName:p.displayName||'',name:(p.portName||p.portId)+(p.displayName?' — '+p.displayName:'')})))}
function cancelSelection(){if(selection){const old=selection;selection=null;old.callback('')}}
function createWindow(){win=new BrowserWindow({width:1440,height:1040,minWidth:900,minHeight:650,backgroundColor:'#09111e',title:'HamTec ID51 Control',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 const ses=win.webContents.session;
 ses.removeAllListeners('select-serial-port');ses.removeAllListeners('serial-port-added');ses.removeAllListeners('serial-port-removed');
 ses.on('select-serial-port',(event,ports,wc,callback)=>{event.preventDefault();if(wc!==win.webContents)return callback('');cancelSelection();selection={ports:[...ports],callback};sendPorts()});
 ses.on('serial-port-added',(_e,p)=>{if(selection){selection.ports=selection.ports.filter(x=>x.portId!==p.portId);selection.ports.push(p);sendPorts()}});
 ses.on('serial-port-removed',(_e,p)=>{if(selection){selection.ports=selection.ports.filter(x=>x.portId!==p.portId);sendPorts()}});
 ses.setPermissionCheckHandler((wc,permission)=>permission==='serial'&&wc===win.webContents&&wc.getURL()===entry);
 ses.setPermissionRequestHandler((wc,permission,callback)=>callback(permission==='serial'&&wc===win.webContents&&wc.getURL()===entry));
 // Use Electron's default per-window grants after the explicit chooser.
 // Do not automatically grant arbitrary USB devices.
 win.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://www.icomjapan.com/')||url.startsWith('https://www.icomamerica.com/'))shell.openExternal(url);return{action:'deny'}});
 win.webContents.on('will-navigate',(e,url)=>{if(url!==entry)e.preventDefault()});
 win.on('closed',()=>{cancelSelection();win=null});
 win.loadFile(path.join(__dirname,'ui','index.html'));
 Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'File',submenu:[{label:'Quit',role:'quit'}]},{label:'View',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]},{label:'Help',submenu:[{label:'Connection settings',click:()=>win.webContents.send('open-setup')},{label:'About',click:()=>require('electron').dialog.showMessageBox(win,{message:'HamTec ID51 Control 0.2.2',detail:'Independent offline desktop application. Icom ID-51 Plus2 CI-V control; physical hardware validation pending. Radio photo supplied by user, bearing RigPix attribution.'})}]}]));
}
ipcMain.on('serial-choice',(event,id)=>{if(!safeSender(event)||!selection||typeof id!=='string')return;const p=selection.ports.find(p=>p.portId===id);const old=selection;selection=null;if(p)win.webContents.send('serial-selected',{portName:p.portName||p.portId,displayName:p.displayName||''});old.callback(p?p.portId:'')});
app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})});app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});

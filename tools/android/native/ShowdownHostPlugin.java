package com.kdmhunt.hunt;

import android.view.WindowManager;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

/** Foreground-only LAN viewer. No controller API is exposed over HTTP. */
@CapacitorPlugin(name="ShowdownHost")
public class ShowdownHostPlugin extends Plugin {
    private volatile ServerSocket server;
    private volatile boolean active;
    private volatile byte[] snapshot = "null".getBytes(StandardCharsets.UTF_8);
    private ExecutorService workers;
    private JSArray sharedUrls = new JSArray();

    @PluginMethod public void start(PluginCall call) {
        stopServer();
        try {
            active = true; snapshot = "null".getBytes(StandardCharsets.UTF_8);
            server = new ServerSocket(0);
            workers = new ThreadPoolExecutor(2, 6, 30, TimeUnit.SECONDS, new ArrayBlockingQueue<>(24));
            final ServerSocket listener = server;
            final ExecutorService pool = workers;
            new Thread(() -> {
                while(!listener.isClosed()) try {
                    Socket socket = listener.accept(); socket.setSoTimeout(5000);
                    try { pool.execute(() -> respond(socket)); } catch(RejectedExecutionException e) { socket.close(); }
                } catch(IOException ignored) { break; }
            }, "kdm-showdown-listener").start();
            JSArray urls = new JSArray();
            Enumeration<NetworkInterface> nets = NetworkInterface.getNetworkInterfaces();
            while(nets.hasMoreElements()) {
                NetworkInterface net = nets.nextElement(); if(!net.isUp() || net.isLoopback()) continue;
                Enumeration<InetAddress> addresses = net.getInetAddresses();
                while(addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if(addr instanceof Inet4Address && !addr.isLoopbackAddress()) urls.put("http://"+addr.getHostAddress()+":"+server.getLocalPort()+"/d/");
                }
            }
            if(urls.length()==0) { stopServer(); call.reject("未找到局域网地址，请连接 Wi-Fi 或开启热点。"); return; }
            sharedUrls=urls;
            getActivity().runOnUiThread(() -> getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON));
            JSObject result = new JSObject(); result.put("urls",urls); call.resolve(result);
        } catch(Exception e) { stopServer(); call.reject("无法开启第二屏幕："+e.getMessage()); }
    }

    @PluginMethod public void publish(PluginCall call) {
        JSObject s = call.getObject("snapshot");
        if(!active || s==null || s.optInt("schemaVersion")!=1 || !s.has("battleId") || !s.has("revision")) { call.reject("无效的决战快照或分享已停止"); return; }
        byte[] bytes = s.toString().getBytes(StandardCharsets.UTF_8);
        if(bytes.length>2000000) { call.reject("决战快照过大"); return; }
        snapshot=bytes; call.resolve();
    }
    @PluginMethod public void stop(PluginCall call) { stopServer(); call.resolve(); }
    @PluginMethod public void status(PluginCall call) { JSObject result=new JSObject();result.put("active",active);result.put("urls",sharedUrls);call.resolve(result); }
    private synchronized void stopServer() {
        active=false;
        try { if(server!=null)server.close(); } catch(IOException ignored) {}
        server=null;
        if(workers!=null)workers.shutdownNow();
        if(getActivity()!=null)getActivity().runOnUiThread(() -> getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON));
    }
    @Override protected void handleOnDestroy() { stopServer(); }
    private String line(InputStream in) throws IOException {
        ByteArrayOutputStream b=new ByteArrayOutputStream(); int c;
        while((c=in.read())!=-1 && c!='\n') { if(b.size()>8192)throw new IOException("Header too long"); if(c!='\r')b.write(c); }
        return b.toString("US-ASCII");
    }
    private void respond(Socket socket) {
        try(Socket connection=socket) {
            InputStream in=connection.getInputStream(); OutputStream out=connection.getOutputStream();
            String[] request=line(in).split(" ");
            if(request.length!=3 || !request[0].equals("GET")) { send(out,405,"text/plain",new byte[0]); return; }
            for(int i=0;i<64;i++) { if(line(in).isEmpty())break; if(i==63)throw new IOException("Too many headers"); }
            String path=URLDecoder.decode(request[1].split("\\?",2)[0],"UTF-8");
            String rest;
            if(!active) { send(out,404,"text/plain",new byte[0]); return; }
            // `/d/` is the fixed short link. `/display/<anything>/` stays valid so
            // a window opened before the shortening keeps refreshing.
            if(path.startsWith("/d/")) rest=path.substring("/d/".length());
            else if(path.equals("/d")) rest="";
            else if(path.startsWith("/display/")) {
                String tail=path.substring("/display/".length());
                int slash=tail.indexOf('/');
                rest=slash<0?"":tail.substring(slash+1);
            } else { send(out,404,"text/plain",new byte[0]); return; }
            if(rest.startsWith("/"))rest=rest.substring(1);
            if(rest.equals("state")) { send(out,200,"application/json; charset=utf-8",snapshot); return; }
            if(rest.isEmpty())rest="assets/showdown-viewer.html";
            if(!rest.startsWith("assets/") || rest.contains("..") || rest.contains("\\") || rest.indexOf('\0')>=0) { send(out,404,"text/plain",new byte[0]); return; }
            try(InputStream asset=getContext().getAssets().open("public/"+rest)) {
                ByteArrayOutputStream bytes=new ByteArrayOutputStream(); byte[] buffer=new byte[16384]; int count;
                while((count=asset.read(buffer))!=-1)bytes.write(buffer,0,count);
                String type=rest.endsWith(".js")?"application/javascript":rest.endsWith(".css")?"text/css":rest.endsWith(".html")?"text/html; charset=utf-8":rest.endsWith(".png")?"image/png":rest.endsWith(".webp")?"image/webp":rest.endsWith(".svg")?"image/svg+xml":"image/jpeg";
                send(out,200,type,bytes.toByteArray());
            } catch(FileNotFoundException e) { send(out,404,"text/plain",new byte[0]); }
        } catch(Exception ignored) { /* A disconnected viewer will retry. */ }
    }
    private void send(OutputStream out,int status,String type,byte[] body) throws IOException {
        String headers="HTTP/1.1 "+status+(status==200?" OK":" Error")+"\r\nContent-Type: "+type+"\r\nContent-Length: "+body.length+"\r\nCache-Control: no-store\r\nReferrer-Policy: no-referrer\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n";
        out.write(headers.getBytes(StandardCharsets.US_ASCII)); out.write(body); out.flush();
    }
}

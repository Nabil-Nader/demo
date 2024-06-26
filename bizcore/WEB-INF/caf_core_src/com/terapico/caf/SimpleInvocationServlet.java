package com.terapico.caf;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.skynet.bootstrap.MultiReadHttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SimpleInvocationServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	
	protected void doPut2(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException 
	{
		String str=null;
		StringBuilder resultString =new StringBuilder();
		
		while ((str = request.getReader().readLine()) != null) {
			resultString.append(str);
		}
		response.getWriter().print(resultString.toString());
	}
	
	@Override
	protected void doPut(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException 
	{
		this.doTheJob(request, response);
	}
	protected void doTheJob(HttpServletRequest inputRequest, HttpServletResponse response)
			throws ServletException, IOException{
		MultiReadHttpServletRequest request = null;
		if (inputRequest instanceof MultiReadHttpServletRequest){
			request = (MultiReadHttpServletRequest)inputRequest;
		}else{
			request = new MultiReadHttpServletRequest(inputRequest);
		}
		long start = System.currentTimeMillis();
		InvocationResult result = getResult(request, response);
		long javaCallInterval = System.currentTimeMillis();
		render(request, response, result);
		long renderCallInterval = System.currentTimeMillis();
		String logContent  = String.format(
				"#########################################Took: %d/%d/%d of TOTAL/BACKEND/RENDERING for '%s' in millisecodns",
				
				 (renderCallInterval - start) ,
				 (javaCallInterval - start),
				 (renderCallInterval - javaCallInterval),request.getRequestURL().toString()
				);
		
				
		logInfo(logContent);
		
	}
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		this.doTheJob(request, response);
	}
	
	@Override
	protected void doOptions(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String origin=request.getHeader("Origin");
		if(origin==null){
			origin = "*";
		}
		response.addHeader("Access-Control-Allow-Origin",origin);
		response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT");
		// Access-Control-Expose-Headers
		String reqedHeaders = request.getHeader("Access-Control-Request-Headers");
		response.addHeader("Access-Control-Allow-Headers", reqedHeaders+", X-Redirect, X-Env-Type, X-Env-Name");
		response.addHeader("Access-Control-Allow-Credentials", "true");
		return;

	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		this.doTheJob(request, response);
		
		/*
		long start = System.currentTimeMillis();
		InvocationResult result = getResult(request, response);
		long javaCallInterval = System.currentTimeMillis();
		render(request, response, result);
		long renderCallInterval = System.currentTimeMillis();
		logInfo("#########################################The call took: "

				+ (renderCallInterval - start) + "ms/" + (javaCallInterval - start) + "ms/"
				+ (renderCallInterval - javaCallInterval) + "ms for TOTAL/BACKEND/RENDERING");
		*/		
	}

	protected void render(HttpServletRequest request, HttpServletResponse response, InvocationResult result)
			throws ServletException, IOException {
	    preRender(result);
		ServletResultRenderer renderer = getResultRenderer();
		renderer.render(this, request, response, result);
	}

  // 在渲染前给应用程序提供整体修改结果的机制
  private void preRender(InvocationResult result) {
    BeanFactory beanFactory = factory.getBeanFactory();
    if (beanFactory instanceof SpringBeanFactory) {
      Map<String, ResultUpdater> beansOfType =
              ((SpringBeanFactory) beanFactory).springFactory().getBeansOfType(ResultUpdater.class);

      if (beansOfType.isEmpty()) {
        return;
      }

      for (ResultUpdater updater : beansOfType.values()) {
        updater.preRender(result);
      }
    }
  }

	protected InvocationResult getResult(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		try {
			InvocationContext context = createInvocationContext(request);
			if (context == null) {
				return wrapExceptionResult(new ServletException("The context should be prepared for call."), null);
			}

			InvocationResult result = invoke(context);

			if (result == null) {
				return wrapExceptionResult(new ServletException("The result should not to be null."), context);
			}
			return result;

		} catch (Throwable e) {

			return wrapExceptionResult(e, null);
		}
	}

	protected InvocationResult wrapResult(Object actualResult, InvocationContext context) {

		InvocationResult result = new SimpleInvocationResult();
		result.setInvocationContext(context);
		result.setActualResult(actualResult);
		return result;
	}

	protected InvocationResult wrapResult(Object actualResult) {

		return wrapResult(actualResult, null);
	}

	protected InvocationResult wrapExceptionResult(Throwable actualResult, InvocationContext context) {

		System.err.println(actualResult.getMessage());
		return wrapResult(actualResult, null);
	}

	protected String timeExpr() {
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yy-MM-dd'T'HH:mm:ss.SSS");
		// It is not thread safe, how silly the JDK is!!!
		return simpleDateFormat.format(new java.util.Date());
	}

	protected InvocationResult invoke(InvocationContext context) throws ServletException {
		InvocationTool tool = getInvocationTool();
		logInfo("InvocationResult invoke " + context.toString());
		if (tool == null) {
			throw new ServletException("Invocation tool must be configured");
		}
		try {
			return tool.invoke(context);
		} catch (InvocationException e) {
			e.printStackTrace();
			throw new ServletException(e);
		}

	}
	
	
	
	private static final Logger logger = LoggerFactory.getLogger(SimpleInvocationServlet.class);
	
	private void logInfo(String message) {
		
		logger.info(message);
		
	}
	
	ServletInvocationContextFactory factory;

	protected InvocationContext createInvocationContext(HttpServletRequest request) throws InvocationException {

		if (factory == null) {
			factory = InternalBeanFactory.getDefaultInvocationContextFactory();
			// cache the reference.
		}

		return factory.create(request);
	}

	InvocationTool tool;

	protected InvocationTool getInvocationTool() {
		if (tool == null) {
			tool = InternalBeanFactory.getDefaultInvocationTool();
			// cache the reference.
		}
		return tool;

	}

	ServletResultRenderer render;

	protected ServletResultRenderer getResultRenderer() {
		if (render == null) {
			render = InternalBeanFactory.getDefaultRenderer();
			// cache the reference.
		}
		return render;
	}

}

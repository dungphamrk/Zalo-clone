//package com.example.zalocloneserver.config;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.scheduling.annotation.EnableAsync;
//import org.springframework.scheduling.annotation.EnableScheduling;
//import org.springframework.scheduling.annotation.SchedulingConfigurer;
//import org.springframework.scheduling.config.ScheduledTaskRegistrar;
//import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
//import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
//
//import java.util.concurrent.Executor;
//
//@Configuration
//@EnableScheduling
//@EnableAsync
//public class SchedulingConfig implements SchedulingConfigurer {
//
//    @Value("${app.scheduling.pool-size:10}")
//    private int poolSize;
//
//    @Value("${app.scheduling.thread-name-prefix:sched-}")
//    private String threadNamePrefix;
//
//    @Bean(destroyMethod = "shutdown")
//    public ThreadPoolTaskScheduler taskScheduler() {
//        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
//        scheduler.setPoolSize(poolSize);
//        scheduler.setThreadNamePrefix(threadNamePrefix);
//        scheduler.setAwaitTerminationSeconds(30);
//        scheduler.setWaitForTasksToCompleteOnShutdown(true);
//        return scheduler;
//    }
//
//    @Bean(name = "taskExecutor")
//    public Executor taskExecutor() {
//        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
//        exec.setCorePoolSize(Math.max(2, poolSize / 2));
//        exec.setMaxPoolSize(poolSize);
//        exec.setQueueCapacity(100);
//        exec.setThreadNamePrefix(threadNamePrefix + "-exec-");
//        exec.setWaitForTasksToCompleteOnShutdown(true);
//        exec.setAwaitTerminationSeconds(30);
//        exec.initialize();
//        return exec;
//    }
//
//    @Override
//    public void configureTasks(ScheduledTaskRegistrar scheduledTaskRegistrar) {
//        scheduledTaskRegistrar.setScheduler(taskScheduler());
//    }
//}

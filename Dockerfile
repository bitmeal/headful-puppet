FROM phusion/baseimage:master as init
# clean way to get newest init

FROM node:slim

# setup
ARG APT_FLAGS="-q -y --no-install-recommends"
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update -q

# system deps
RUN apt-get install -q -y python3-minimal
# RUN apt-get install $APT_FLAGS python3 python3-pip wheel

# init
COPY --from=init /sbin/my_init /sbin/my_init
RUN apt-get install $APT_FLAGS runit
# RUN \
#     sed -i 's%usr/bin%sbin%g' /sbin/my_init && sed -i '1s%.*%#!/usr/bin/python3 -u%' /sbin/my_init && \
RUN \
    chmod +x /sbin/my_init && \
    mkdir -p /etc/my_init.d && \
    mkdir -p /etc/my_init.pre_shutdown.d && \
    mkdir -p /etc/my_init.post_shutdown.d

# xvfb
ENV DISPLAY=:99
COPY services/xvfb.init /etc/service/xvfb/run
RUN \
    apt-get install $APT_FLAGS xvfb && \
    chmod +x /etc/service/xvfb/run


# puppeteer/chromium
RUN apt-get install $APT_FLAGS libnss3 libgtk-3-0 libgbm-dev libasound2
COPY services/puppeteer.init /etc/service/puppeteer/run
COPY puppeteer /opt/puppeteer
WORKDIR /opt/puppeteer
RUN \
    npm install && \
    chmod +x /etc/service/puppeteer/run
WORKDIR /


# dbus
# COPY services/dbus.init /etc/service/dbus/run
# RUN \
#     apt-get install $APT_FLAGS dbus && \
#     mkdir -pv /var/run/dbus && \
#     chmod +x /etc/service/dbus/run

# dbus mock (upower) [remember to install pip]
# COPY services/dbus_upower.init /etc/service/dbus_upower/run
# RUN \
#     pip3 install dbus-python python-dbusmock && \
#     chmod +x /etc/service/dbus_upower/run

# headfull proxy
ENV PORT 9222
ENV PORT_INTERNAL 9992
COPY services/proxy.init /etc/service/proxy/run
RUN \
    apt-get install $APT_FLAGS socat && \
    chmod +x /etc/service/proxy/run

# cleanup
RUN apt-get autoremove && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# exec
ENTRYPOINT ["/sbin/my_init", "--"]
CMD []

# web-server
FROM ruby:2.7.6-alpine

ARG FURY_AUTH

ENV BUILD_PACKAGES build-base yarn
ENV DEPENDANCY_PACKAGES git libsndfile libsndfile-dev libxml2-dev libxslt-dev openssl postgresql-dev
ENV RUNTIME_PACKAGES bash curl nodejs openssl mediainfo sox ffmpeg libc6-compat imagemagick
ENV BUNDLE_GEM__FURY__IO ${FURY_AUTH}
ENV DOCKERIZE_VERSION v0.6.1

# extra dependancies
#RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs
# RUN apk add --update --no-cache --virtual build-deps build-base python git bash && gem install libv8 -v 3.16.14.16 && apk del build-deps
RUN apk update && \
  apk upgrade && \
  apk add --virtual build-deps $BUILD_PACKAGES && \
  apk add $DEPENDANCY_PACKAGES && \ 
  apk add $RUNTIME_PACKAGES && \
  rm -rf /var/cache/apk/* 

RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

#RUN apk add --update \
#  --no-cache \
#  --virtual \
#  build-deps \
#  build-base \
#  bash \
#  nodejs \
#  openssl \
#  postgresql-dev \
#  sqlite \
#  sqlite-dev
#  mediainfo

# app directory for installing app into
ENV APP_HOME /app
ENV HOME /root
RUN mkdir $APP_HOME
WORKDIR $APP_HOME

# install gems in a cachable way
COPY Gemfile* $APP_HOME/

RUN gem install bundler -v 2.3.14
RUN gem install foreman

# Use libxml2, libxslt a packages from alpine for building nokogiri
#RUN bundle config build.nokogiri --use-system-libraries
#RUN BUNDLE_FORCE_RUBY_PLATFORM=1 bundle install
RUN BUNDLE_FORCE_RUBY_PLATFORM=1 bundle install 
RUN yarn install 

# clean up dev tools
RUN apk del build-deps
##RUN rm -rf /var/cache/apk/*

RUN cp /usr/bin/mediainfo /usr/local/bin

# re-add bash, lol
# RUN apk add bash

# add the app
ADD . $APP_HOME

CMD ["foreman", "start", "web"]
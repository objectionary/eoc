<?xml version="1.0" encoding="UTF-8"?>
<!--
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <div class="app-block">
      <xsl:for-each select="//o[(@name and (@name != 'φ' and @name != 'λ' and not(starts-with(@name, '+')))) and (not(@base) or (@base != '∅' and @base != 'ξ'))]">
        <xsl:if test="//comments/comment[@line = current()/@line]">
          <div class="object-block">
            <xsl:variable name="fullname">
              <xsl:for-each select="ancestor-or-self::o[@name and @name != 'φ']">
                <xsl:value-of select="@name"/>
                <xsl:choose>
                  <xsl:when test="position() != last()">.</xsl:when>
                </xsl:choose>
              </xsl:for-each>
            </xsl:variable>
            <h2 class="object-title"><xsl:value-of select="$fullname"/></h2>
            <p class="object-sign">
              <xsl:value-of select="$fullname"/>(<xsl:for-each select="current()/o[@base and @base = '∅']">
                <xsl:value-of select="@name"/>
                <xsl:choose>
                  <xsl:when test="position() != last()">, </xsl:when>
                </xsl:choose>
              </xsl:for-each>)</p>
            <p class="object-desc">
              <xsl:call-template name="break">
                <xsl:with-param name="text" select="//comments/comment[@line = current()/@line]"/>
              </xsl:call-template>
            </p>
          </div>
        </xsl:if>
      </xsl:for-each>
    </div>
  </xsl:template>
  <xsl:template name="break">
    <xsl:param name="text" select="string(.)"/>
    <xsl:choose>
      <xsl:when test="contains($text, '\n')">
        <xsl:value-of select="substring-before($text, '\n')"/>
        <br/>
        <xsl:call-template name="break">
          <xsl:with-param 
            name="text" 
            select="substring-after($text, '\n')"
          />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$text"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
